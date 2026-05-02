namespace Xpensoft.Migration.Data;

using Microsoft.EntityFrameworkCore;

using Xpensoft.Migration.TargetModels;

public class TargetDbContext(DbContextOptions<TargetDbContext> options) : DbContext(options)
{
    public DbSet<User>? Users { get; set; }
    public DbSet<Category>? Categories { get; set; }
    public DbSet<Transaction>? Transactions { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Transaction>()
            .Property(t => t.Amount)
            .HasPrecision(8, 2);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

}