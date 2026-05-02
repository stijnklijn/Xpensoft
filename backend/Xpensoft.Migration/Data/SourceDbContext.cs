namespace Xpensoft.Migration.Data;

using Microsoft.EntityFrameworkCore;

using Xpensoft.Migration.SourceModels;

public class SourceDbContext(DbContextOptions<SourceDbContext> options) : DbContext(options)
{
    public DbSet<User>? Users { get; set; }
    public DbSet<Header>? Headers { get; set; }
    public DbSet<Transaction>? Transactions { get; set; }

}