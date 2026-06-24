using DebTecJourney.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace DebTecJourney.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<ApplicationUser> Users => Set<ApplicationUser>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<LearningModule> Modules => Set<LearningModule>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<LessonPage> LessonPages => Set<LessonPage>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<AnswerOption> AnswerOptions => Set<AnswerOption>();
    public DbSet<UserProgress> UserProgress => Set<UserProgress>();
    public DbSet<UserAnswer> UserAnswers => Set<UserAnswer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.HasIndex(user => user.Email).IsUnique();
            entity.Property(user => user.Name).HasMaxLength(120);
            entity.Property(user => user.Email).HasMaxLength(180);
            entity.Property(user => user.PasswordHash).HasMaxLength(500);
            entity.Property(user => user.AcademicProfile).HasMaxLength(80);
            entity.Property(user => user.ExperienceLevel).HasMaxLength(80);
            entity.Property(user => user.LearningGoal).HasMaxLength(120);
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.Property(course => course.Title).HasMaxLength(160);
            entity.Property(course => course.Description).HasMaxLength(600);
            entity.HasMany(course => course.Modules)
                .WithOne(module => module.Course)
                .HasForeignKey(module => module.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LearningModule>(entity =>
        {
            entity.Property(module => module.Title).HasMaxLength(160);
            entity.Property(module => module.Description).HasMaxLength(600);
            entity.HasMany(module => module.Lessons)
                .WithOne(lesson => lesson.Module)
                .HasForeignKey(lesson => lesson.ModuleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Lesson>(entity =>
        {
            entity.Property(lesson => lesson.Title).HasMaxLength(180);
            entity.Property(lesson => lesson.Summary).HasMaxLength(500);
            entity.HasMany(lesson => lesson.Pages)
                .WithOne(page => page.Lesson)
                .HasForeignKey(page => page.LessonId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(lesson => lesson.Questions)
                .WithOne(question => question.Lesson)
                .HasForeignKey(question => question.LessonId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LessonPage>(entity =>
        {
            entity.Property(page => page.Title).HasMaxLength(180);
            entity.Property(page => page.Highlight).HasMaxLength(500);
        });

        modelBuilder.Entity<Question>(entity =>
        {
            entity.Property(question => question.Statement).HasMaxLength(600);
            entity.Property(question => question.Explanation).HasMaxLength(1000);
            entity.HasMany(question => question.AnswerOptions)
                .WithOne(option => option.Question)
                .HasForeignKey(option => option.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AnswerOption>(entity =>
        {
            entity.Property(option => option.Text).HasMaxLength(600);
            entity.Property(option => option.Feedback).HasMaxLength(1000);
        });

        modelBuilder.Entity<UserProgress>(entity =>
        {
            entity.HasIndex(progress => new { progress.UserId, progress.LessonId }).IsUnique();
            entity.Property(progress => progress.Status).HasMaxLength(40);
            entity.HasOne(progress => progress.User)
                .WithMany(user => user.Progress)
                .HasForeignKey(progress => progress.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(progress => progress.Lesson)
                .WithMany()
                .HasForeignKey(progress => progress.LessonId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserAnswer>(entity =>
        {
            entity.HasOne(answer => answer.User)
                .WithMany(user => user.Answers)
                .HasForeignKey(answer => answer.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(answer => answer.Question)
                .WithMany()
                .HasForeignKey(answer => answer.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(answer => answer.AnswerOption)
                .WithMany()
                .HasForeignKey(answer => answer.AnswerOptionId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
