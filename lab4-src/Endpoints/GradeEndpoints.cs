using Lab4.Data;
using Lab4.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Lab4.Endpoints;

public static class GradeEndpoints
{
    private const string AllGradesCacheKey = "grades:all";

    public static void MapGradeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/grades").WithTags("Grades");

        group.MapGet("/", async (UniversityDbContext db, IMemoryCache cache) =>
        {
            if (cache.TryGetValue(AllGradesCacheKey, out List<object>? cached))
                return Results.Ok(cached);

            var grades = await db.Grades
                .AsNoTracking()
                .Include(g => g.Student)
                .Include(g => g.Course)
                .Select(g => new
                {
                    g.Id,
                    g.Value,
                    g.GradedAt,
                    Student = $"{g.Student.FirstName} {g.Student.LastName}",
                    Course = g.Course.Name
                })
                .ToListAsync();

            cache.Set(AllGradesCacheKey, grades, TimeSpan.FromMinutes(3));
            return Results.Ok(grades);
        });

        group.MapGet("/{id:int}", async (int id, UniversityDbContext db, IMemoryCache cache) =>
        {
            var cacheKey = $"grades:{id}";
            if (cache.TryGetValue(cacheKey, out object? cached))
                return Results.Ok(cached);

            var grade = await db.Grades
                .AsNoTracking()
                .Include(g => g.Student)
                .Include(g => g.Course)
                .Where(g => g.Id == id)
                .Select(g => new
                {
                    g.Id,
                    g.Value,
                    g.GradedAt,
                    Student = $"{g.Student.FirstName} {g.Student.LastName}",
                    Course = g.Course.Name
                })
                .FirstOrDefaultAsync();

            if (grade is null) return Results.NotFound();

            cache.Set(cacheKey, grade, TimeSpan.FromMinutes(3));
            return Results.Ok(grade);
        });

        group.MapPost("/", async (GradeRequest req, UniversityDbContext db, IMemoryCache cache) =>
        {
            var studentExists = await db.Students.AnyAsync(s => s.Id == req.StudentId);
            if (!studentExists) return Results.BadRequest("Student not found.");

            var courseExists = await db.Courses.AnyAsync(c => c.Id == req.CourseId);
            if (!courseExists) return Results.BadRequest("Course not found.");

            var grade = new Grade
            {
                StudentId = req.StudentId,
                CourseId = req.CourseId,
                Value = req.Value,
                GradedAt = DateTime.UtcNow
            };
            db.Grades.Add(grade);
            await db.SaveChangesAsync();
            cache.Remove(AllGradesCacheKey);
            return Results.Created($"/api/grades/{grade.Id}", grade);
        });

        group.MapPut("/{id:int}", async (int id, GradeUpdateRequest req, UniversityDbContext db, IMemoryCache cache) =>
        {
            var grade = await db.Grades.FindAsync(id);
            if (grade is null) return Results.NotFound();

            grade.Value = req.Value;
            grade.GradedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            cache.Remove(AllGradesCacheKey);
            cache.Remove($"grades:{id}");
            return Results.Ok(grade);
        });

        group.MapDelete("/student/{studentId:int}", async (int studentId, UniversityDbContext db, IMemoryCache cache) =>
        {
            var student = await db.Students
                .Include(s => s.Grades)
                .FirstOrDefaultAsync(s => s.Id == studentId);

            if (student is null) return Results.NotFound();

            await using var transaction = await db.Database.BeginTransactionAsync();
            try
            {
                db.Grades.RemoveRange(student.Grades);
                db.Students.Remove(student);
                await db.SaveChangesAsync();
                await transaction.CommitAsync();

                cache.Remove(AllGradesCacheKey);
                return Results.NoContent();
            }
            catch
            {
                await transaction.RollbackAsync();
                return Results.Problem("Failed to delete student and grades.");
            }
        });

        group.MapPatch("/batch-update", async (BatchGradeUpdateRequest req, UniversityDbContext db, IMemoryCache cache) =>
        {
            await using var transaction = await db.Database.BeginTransactionAsync();
            try
            {
                var updatedIds = new List<int>();
                foreach (var item in req.Updates)
                {
                    var grade = await db.Grades.FindAsync(item.GradeId);
                    if (grade is null) continue;

                    grade.Value = item.Value;
                    grade.GradedAt = DateTime.UtcNow;
                    updatedIds.Add(grade.Id);
                }

                await db.SaveChangesAsync();
                await transaction.CommitAsync();

                cache.Remove(AllGradesCacheKey);
                foreach (var id in updatedIds)
                    cache.Remove($"grades:{id}");

                return Results.Ok(new { Updated = updatedIds.Count });
            }
            catch
            {
                await transaction.RollbackAsync();
                return Results.Problem("Batch update failed.");
            }
        });
    }
}

record GradeRequest(int StudentId, int CourseId, decimal Value);
record GradeUpdateRequest(decimal Value);
record GradeUpdateItem(int GradeId, decimal Value);
record BatchGradeUpdateRequest(List<GradeUpdateItem> Updates);
