using Lab4.Data;
using Lab4.Models;
using Microsoft.EntityFrameworkCore;

namespace Lab4.Endpoints;

public static class ClassSessionEndpoints
{
    public static void MapClassSessionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/classes").WithTags("ClassSessions");

        group.MapGet("/", async (UniversityDbContext db) =>
            await db.ClassSessions
                .AsNoTracking()
                .Include(cs => cs.Course)
                .Select(cs => new
                {
                    cs.Id,
                    cs.ScheduledAt,
                    cs.Location,
                    cs.DurationMinutes,
                    Course = cs.Course.Name
                })
                .ToListAsync());

        group.MapGet("/{id:int}", async (int id, UniversityDbContext db) =>
        {
            var session = await db.ClassSessions
                .AsNoTracking()
                .Include(cs => cs.Course)
                .Where(cs => cs.Id == id)
                .Select(cs => new
                {
                    cs.Id,
                    cs.ScheduledAt,
                    cs.Location,
                    cs.DurationMinutes,
                    Course = cs.Course.Name,
                    CourseId = cs.CourseId
                })
                .FirstOrDefaultAsync();

            return session is null ? Results.NotFound() : Results.Ok(session);
        });

        group.MapPost("/", async (ClassSessionRequest req, UniversityDbContext db) =>
        {
            var courseExists = await db.Courses.AnyAsync(c => c.Id == req.CourseId);
            if (!courseExists) return Results.BadRequest("Course not found.");

            var session = new ClassSession
            {
                CourseId = req.CourseId,
                ScheduledAt = req.ScheduledAt,
                Location = req.Location,
                DurationMinutes = req.DurationMinutes
            };
            db.ClassSessions.Add(session);
            await db.SaveChangesAsync();
            return Results.Created($"/api/classes/{session.Id}", session);
        });

        group.MapPut("/{id:int}", async (int id, ClassSessionRequest req, UniversityDbContext db) =>
        {
            var session = await db.ClassSessions.FindAsync(id);
            if (session is null) return Results.NotFound();

            var courseExists = await db.Courses.AnyAsync(c => c.Id == req.CourseId);
            if (!courseExists) return Results.BadRequest("Course not found.");

            session.CourseId = req.CourseId;
            session.ScheduledAt = req.ScheduledAt;
            session.Location = req.Location;
            session.DurationMinutes = req.DurationMinutes;
            await db.SaveChangesAsync();
            return Results.Ok(session);
        });

        group.MapDelete("/{id:int}", async (int id, UniversityDbContext db) =>
        {
            var session = await db.ClassSessions.FindAsync(id);
            if (session is null) return Results.NotFound();

            db.ClassSessions.Remove(session);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}

record ClassSessionRequest(int CourseId, DateTime ScheduledAt, string Location, int DurationMinutes);
