namespace Lab4.Models;

public class Grade
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public int CourseId { get; set; }
    public decimal Value { get; set; }
    public DateTime GradedAt { get; set; }

    public Student Student { get; set; } = null!;
    public Course Course { get; set; } = null!;
}
