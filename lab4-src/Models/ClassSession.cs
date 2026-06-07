namespace Lab4.Models;

public class ClassSession
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string Location { get; set; } = null!;
    public int DurationMinutes { get; set; }

    public Course Course { get; set; } = null!;
}
