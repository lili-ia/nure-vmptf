using Lab4.Data;
using Lab4.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Lab4.Endpoints;

public static class CourseEndpoints
{
    private const string AllCoursesCacheKey = "courses:all";

    public static void MapCourseEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/courses").WithTags("Courses");

        group.MapGet("/", async (UniversityDbContext db, IMemoryCache cache) =>
        {
            if (cache.TryGetValue(AllCoursesCacheKey, out List<object>? cached))
                return Results.Ok(cached);

            var courses = await db.Courses
                .AsNoTracking()
                .Include(c => c.Teacher)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    c.Credits,
                    Teacher = $"{c.Teacher.FirstName} {c.Teacher.LastName}"
                })
                .ToListAsync();

            cache.Set(AllCoursesCacheKey, courses, TimeSpan.FromMinutes(5));
            return Results.Ok(courses);
        });

        group.MapGet("/{id:int}", async (int id, UniversityDbContext db, IMemoryCache cache) =>
        {
            var cacheKey = $"courses:{id}";
            if (cache.TryGetValue(cacheKey, out object? cached))
                return Results.Ok(cached);

            var course = await db.Courses
                .AsNoTracking()
                .Include(c => c.Teacher)
                .Include(c => c.ClassSessions)
                .Where(c => c.Id == id)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    c.Credits,
                    Teacher = $"{c.Teacher.FirstName} {c.Teacher.LastName}",
                    Sessions = c.ClassSessions.Count
                })
                .FirstOrDefaultAsync();

            if (course is null) return Results.NotFound();

            cache.Set(cacheKey, course, TimeSpan.FromMinutes(5));
            return Results.Ok(course);
        });

        group.MapPost("/", async (CourseRequest req, UniversityDbContext db, IMemoryCache cache) =>
        {
            var teacherExists = await db.Teachers.AnyAsync(t => t.Id == req.TeacherId);
            if (!teacherExists) return Results.BadRequest("Teacher not found.");

            var course = new Course
            {
                Name = req.Name,
                Description = req.Description,
                Credits = req.Credits,
                TeacherId = req.TeacherId
            };
            db.Courses.Add(course);
            await db.SaveChangesAsync();
            cache.Remove(AllCoursesCacheKey);
            return Results.Created($"/api/courses/{course.Id}", course);
        });

        group.MapPut("/{id:int}", async (int id, CourseRequest req, UniversityDbContext db, IMemoryCache cache) =>
        {
            var course = await db.Courses.FindAsync(id);
            if (course is null) return Results.NotFound();

            var teacherExists = await db.Teachers.AnyAsync(t => t.Id == req.TeacherId);
            if (!teacherExists) return Results.BadRequest("Teacher not found.");

            course.Name = req.Name;
            course.Description = req.Description;
            course.Credits = req.Credits;
            course.TeacherId = req.TeacherId;
            await db.SaveChangesAsync();

            cache.Remove(AllCoursesCacheKey);
            cache.Remove($"courses:{id}");
            return Results.Ok(course);
        });

        group.MapDelete("/{id:int}", async (int id, UniversityDbContext db, IMemoryCache cache) =>
        {
            var course = await db.Courses.FindAsync(id);
            if (course is null) return Results.NotFound();

            db.Courses.Remove(course);
            await db.SaveChangesAsync();

            cache.Remove(AllCoursesCacheKey);
            cache.Remove($"courses:{id}");
            return Results.NoContent();
        });
    }
}

record CourseRequest(string Name, string Description, int Credits, int TeacherId);
