using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using Xpensoft.Migration.Data;

public class Program
{
    public static async Task Main(string[] args)
    {
        using IHost host = Host.CreateDefaultBuilder(args)
        .ConfigureServices((context, services) =>
        {
            Console.WriteLine("Source ConnectionString: ");
            var sourceConnectionString = Console.ReadLine();
            Console.WriteLine("Target ConnectionString: ");
            var targetConnectionString = Console.ReadLine();

            services.AddDbContext<SourceDbContext>(options =>
        {
            options.UseMySql(
                sourceConnectionString,
                ServerVersion.AutoDetect(sourceConnectionString));
        });

            services.AddDbContext<TargetDbContext>(options =>
            {
                options.UseSqlServer(targetConnectionString);
            });

            services.AddTransient<MigrationRunner>();
        })
        .Build();

        using (var scope = host.Services.CreateScope())
        {
            var source = scope.ServiceProvider.GetRequiredService<SourceDbContext>();
            var target = scope.ServiceProvider.GetRequiredService<TargetDbContext>();

            Console.WriteLine($"Source DB reachable: {await source.Database.CanConnectAsync()}");
            Console.WriteLine($"Target DB reachable: {await target.Database.CanConnectAsync()}");

            await scope.ServiceProvider.GetRequiredService<MigrationRunner>().RunAsync();
        }
    }
}

public class MigrationRunner(SourceDbContext source, TargetDbContext target)
{
    private readonly SourceDbContext _source = source;
    private readonly TargetDbContext _target = target;

    public async Task RunAsync()
    {
        Console.WriteLine("Source user ID: ");
        string sourceUserIdString = Console.ReadLine()!;
        int sourceUserId = int.Parse(sourceUserIdString);

        Console.WriteLine("Target user ID: ");
        string targetUserIdString = Console.ReadLine()!;
        Guid targetUserId = Guid.Parse(targetUserIdString);

        //Migrate Headers/Categories
        IList<Xpensoft.Migration.SourceModels.Header> sourceHeaders = await _source.Headers!.AsNoTracking().Where(h => h.UserId == sourceUserId).ToListAsync();

        Dictionary<int, Guid> sourceToTargetCategoryId = [];

        foreach (var header in sourceHeaders)
        {

            Xpensoft.Migration.TargetModels.Category targetCategory = new()
            {
                UserId = targetUserId,
                User = null!,
                Name = header.Name,
                IsIncome = header.Income
            };
            await _target.AddAsync(targetCategory);

            sourceToTargetCategoryId[header.Id] = targetCategory.Id;
        }

        //Migrate Transactions
        IList<Xpensoft.Migration.SourceModels.Transaction> sourceTransactions = await _source.Transactions!.AsNoTracking().ToListAsync();

        foreach (var transaction in sourceTransactions)
        {

            if (sourceToTargetCategoryId.ContainsKey(transaction.HeaderId))
            {
                Xpensoft.Migration.TargetModels.Transaction targetTransaction = new Xpensoft.Migration.TargetModels.Transaction
                {
                    UserId = targetUserId,
                    User = null!,
                    CategoryId = sourceToTargetCategoryId[transaction.HeaderId],
                    Date = transaction.Date,
                    Description = transaction.Description,
                    Amount = transaction.Amount
                };
                await _target.AddAsync(targetTransaction);

            }
        }

        await _target.SaveChangesAsync();

        await Task.CompletedTask;
    }
}