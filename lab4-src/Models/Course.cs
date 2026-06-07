namespace Lab4.Models;

public class Course
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int Credits { get; set; }
    public int TeacherId { get; set; }

    public Teacher Teacher { get; set; } = null!;
    public ICollection<ClassSession> ClassSessions { get; set; } = [];
    public ICollection<Grade> Grades { get; set; } = [];
}
