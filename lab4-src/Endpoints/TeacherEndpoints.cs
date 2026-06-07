using Lab4.Data;
using Lab4.Models;
using Microsoft.EntityFrameworkCore;

namespace Lab4.Endpoints;

public static class TeacherEndpoints
{
    public static void MapTeacherEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/teachers").WithTags("Teachers");

        group.MapGet("/", async (UniversityDbContext db) =>
            await db.Teachers.AsNoTracking().ToListAsync());

        group.MapGet("/{id:int}", async (int id, UniversityDbContext db) =>
            await db.Teachers.FindAsync(id) is { } teacher
                ? Results.Ok(teacher)
                : Results.NotFound());

        group.MapPost("/", async (TeacherRequest req, UniversityDbContext db) =>
        {
            var teacher = new Teacher
            {
                FirstName = req.FirstName,
                LastName = req.LastName,
                Email = req.Email,
                Department = req.Department
            };
            db.Teachers.Add(teacher);
            await db.SaveChangesAsync();
            return Results.Created($"/api/teachers/{teacher.Id}", teacher);
        });

        group.MapPut("/{id:int}", async (int id, TeacherRequest req, UniversityDbContext db) =>
        {
            var teacher = await db.Teachers.FindAsync(id);
            if (teacher is null) return Results.NotFound();

            teacher.FirstName = req.FirstName;
            teacher.LastName = req.LastName;
            teacher.Email = req.Email;
            teacher.Department = req.Department;
            await db.SaveChangesAsync();
            return Results.Ok(teacher);
        });

        group.MapDelete("/{id:int}", async (int id, UniversityDbContext db) =>
        {
            var teacher = await db.Teachers.FindAsync(id);
            if (teacher is null) return Results.NotFound();

            db.Teachers.Remove(teacher);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}

record TeacherRequest(string FirstName, string LastName, string Email, string Department);
