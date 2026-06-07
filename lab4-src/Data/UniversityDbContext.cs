using Lab4.Models;
using Microsoft.EntityFrameworkCore;

namespace Lab4.Data;

public class UniversityDbContext(DbContextOptions<UniversityDbContext> options) : DbContext(options)
{
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<ClassSession> ClassSessions => Set<ClassSession>();
    public DbSet<Grade> Grades => Set<Grade>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Student>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.Email).IsRequired().HasMaxLength(200);
            e.HasIndex(s => s.Email).IsUnique();
            e.Property(s => s.FirstName).IsRequired().HasMaxLength(100);
            e.Property(s => s.LastName).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<Teacher>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Email).IsRequired().HasMaxLength(200);
            e.HasIndex(t => t.Email).IsUnique();
            e.Property(t => t.FirstName).IsRequired().HasMaxLength(100);
            e.Property(t => t.LastName).IsRequired().HasMaxLength(100);
            e.Property(t => t.Department).IsRequired().HasMaxLength(150);
        });

        modelBuilder.Entity<Course>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Name).IsRequired().HasMaxLength(200);
            e.Property(c => c.Description).HasMaxLength(1000);
            e.Property(c => c.Credits).IsRequired();
            e.HasOne(c => c.Teacher)
                .WithMany(t => t.Courses)
                .HasForeignKey(c => c.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ClassSession>(e =>
        {
            e.HasKey(cs => cs.Id);
            e.Property(cs => cs.Location).IsRequired().HasMaxLength(200);
            e.HasOne(cs => cs.Course)
                .WithMany(c => c.ClassSessions)
                .HasForeignKey(cs => cs.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Grade>(e =>
        {
            e.HasKey(g => g.Id);
            e.Property(g => g.Value).HasPrecision(4, 2);
            e.HasOne(g => g.Student)
                .WithMany(s => s.Grades)
                .HasForeignKey(g => g.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(g => g.Course)
                .WithMany(c => c.Grades)
                .HasForeignKey(g => g.CourseId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(g => new { g.StudentId, g.CourseId }).IsUnique();
        });
    }
}
