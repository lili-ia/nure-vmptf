using Lab4.Data;
using Lab4.Models;
using Microsoft.EntityFrameworkCore;

namespace Lab4.Endpoints;

public static class StudentEndpoints
{
    public static void MapStudentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/students").WithTags("Students");

        group.MapGet("/", async (UniversityDbContext db) =>
            await db.Students.AsNoTracking().ToListAsync());

        group.MapGet("/{id:int}", async (int id, UniversityDbContext db) =>
            await db.Students.FindAsync(id) is { } student
                ? Results.Ok(student)
                : Results.NotFound());

        group.MapGet("/{id:int}/grades", async (int id, UniversityDbContext db) =>
        {
            var exists = await db.Students.AnyAsync(s => s.Id == id);
            if (!exists) return Results.NotFound();

            var grades = await db.Grades
                .AsNoTracking()
                .Where(g => g.StudentId == id)
                .Include(g => g.Course)
                .Select(g => new
                {
                    g.Id,
                    g.Value,
                    g.GradedAt,
                    Course = g.Course.Name
                })
                .ToListAsync();

            return Results.Ok(grades);
        });

        group.MapPost("/", async (StudentRequest req, UniversityDbContext db) =>
        {
            var student = new Student
            {
                FirstName = req.FirstName,
                LastName = req.LastName,
                Email = req.Email,
                DateOfBirth = req.DateOfBirth
            };
            db.Students.Add(student);
            await db.SaveChangesAsync();
            return Results.Created($"/api/students/{student.Id}", student);
        });

        group.MapPut("/{id:int}", async (int id, StudentRequest req, UniversityDbContext db) =>
        {
            var student = await db.Students.FindAsync(id);
            if (student is null) return Results.NotFound();

            student.FirstName = req.FirstName;
            student.LastName = req.LastName;
            student.Email = req.Email;
            student.DateOfBirth = req.DateOfBirth;
            await db.SaveChangesAsync();
            return Results.Ok(student);
        });

        group.MapDelete("/{id:int}", async (int id, UniversityDbContext db) =>
        {
            var student = await db.Students.FindAsync(id);
            if (student is null) return Results.NotFound();

            db.Students.Remove(student);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}

record StudentRequest(string FirstName, string LastName, string Email, DateOnly DateOfBirth);
