using AutoMapper;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using Sieve.Models;
using Sieve.Services;

using Xpensoft.Api.Data;
using Xpensoft.Api.Models;
using Xpensoft.Api.Profiles;

namespace Xpensoft.Tests.TestFactories;

public static class TestUtils
{

    public static XpensoftDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<XpensoftDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new XpensoftDbContext(options);

    }

    public static SieveProcessor CreateSieveProcessor()
    {
        var options = Options.Create(new SieveOptions());
        return new SieveProcessor(options);
    }

    public static IMapper CreateMapper()
    {
        var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<UserProfile>();
            cfg.AddProfile<CategoryProfile>();
            cfg.AddProfile<TransactionProfile>();
        }, loggerFactory);

        return config.CreateMapper();
    }

    public static (Guid, User) CreateUserInDatabase(XpensoftDbContext database)
    {
        Guid userId = Guid.NewGuid();
        User user = new() { Id = userId, Email = "stijnklijn@gmail.com", Password = "Test1234!", FirstName = "Stijn", LastName = "Klijn" };
        database.Add(user);
        database.SaveChanges();
        return (userId, user);
    }

    public static (Guid, Category) CreateCategoryInDatabase(Guid userId, User user, XpensoftDbContext database)
    {
        Guid entityId = Guid.NewGuid();
        Category entity = new() { UserId = userId, User = user, Id = entityId, Name = "Salary", IsIncome = true };
        database.Add(entity);
        database.SaveChanges();
        return (entityId, entity);
    }

    public static (Guid, Transaction) CreateTransactionInDatabase(Guid userId, User user, XpensoftDbContext database)
    {
        Guid entityId = Guid.NewGuid();
        Transaction entity = new() { UserId = userId, User = user, Id = entityId, Date = new DateOnly(2026, 1, 1), Description = "Strawberries", Amount = 2.50M };
        database.Add(entity);
        database.SaveChanges();
        return (entityId, entity);
    }

}