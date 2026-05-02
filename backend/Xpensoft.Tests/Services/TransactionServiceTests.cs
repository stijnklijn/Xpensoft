using AutoMapper;

using Sieve.Models;
using Sieve.Services;

using Xpensoft.Api.Data;
using Xpensoft.Api.Dtos;
using Xpensoft.Api.Exceptions;
using Xpensoft.Api.Models;
using Xpensoft.Api.Services;
using Xpensoft.Api.Services.Pagination;
using Xpensoft.Tests.TestFactories;

namespace Xpensoft.Tests.Services;

public class TransactionServiceTests
{

    private readonly XpensoftDbContext _database;
    private readonly SieveProcessor _sieveProcessor;
    private readonly IMapper _mapper;
    private readonly TransactionService _service;

    public TransactionServiceTests()
    {
        _database = TestUtils.CreateDbContext();
        _mapper = TestUtils.CreateMapper();
        _sieveProcessor = TestUtils.CreateSieveProcessor();
        _service = new TransactionService(_database, _sieveProcessor, _mapper);
    }

    [Fact]
    public async Task Create_ShouldSave()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        TransactionDto dto = new() { Date = new DateOnly(2026, 1, 1), Description = "Strawberries", Amount = 2.50M };

        //Act
        await _service.Create(userId, dto);

        //Assert
        Transaction? actual = _database.Transactions.FirstOrDefault(e => e.Description == "Strawberries");
        Assert.NotNull(actual);
        Assert.Equal(dto.Description, actual.Description);
    }

    [Fact]
    public async Task Create_WhenCategoryNotExists_ShouldThrowException()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        TransactionDto dto = new() { CategoryId = Guid.NewGuid(), Date = new DateOnly(2026, 1, 1), Description = "Strawberries", Amount = 2.50M };

        //Assert
        await Assert.ThrowsAsync<CustomResourceNotFoundException>(() => _service.Create(userId, dto));
    }

    [Fact]
    public async Task ReadAll_ShouldReturnAll()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        Transaction entity1 = new() { UserId = userId, User = user, Date = new DateOnly(2026, 1, 1), Description = "Strawberries", Amount = 2.50M };
        Transaction entity2 = new() { UserId = userId, User = user, Date = new DateOnly(2026, 1, 1), Description = "Oranges", Amount = 3.50M };
        _database.Add<Transaction>(entity1);
        _database.Add<Transaction>(entity2);
        _database.SaveChanges();

        //Act
        PageResult<TransactionDto> actual = await _service.ReadAll(userId, new SieveModel());

        //Assert
        Assert.NotNull(actual);
        Assert.Equal(2, actual.TotalResults);
        Assert.NotNull(actual.Data);
        Assert.Contains(actual.Data, d => d.Description == entity1.Description);
        Assert.Contains(actual.Data, d => d.Description == entity2.Description);
    }

    [Fact]
    public async Task ReadById_ShouldReturnOne()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        (Guid entityId, Transaction entity) = TestUtils.CreateTransactionInDatabase(userId, user, _database);

        //Act
        TransactionDto actual = await _service.ReadById(userId, entityId);

        //Assert
        Assert.NotNull(actual);
        Assert.Equal(entity.Id, actual.Id);
    }

    [Fact]
    public async Task ReadById_WhenNotExists_ShouldThrowException()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);

        //Assert
        await Assert.ThrowsAsync<CustomResourceNotFoundException>(() => _service.ReadById(userId, Guid.NewGuid()));
    }

    [Fact]
    public async Task Update_ShouldSave()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        (Guid entityId, Transaction entity) = TestUtils.CreateTransactionInDatabase(userId, user, _database);
        TransactionDto dto = new() { Date = new DateOnly(2026, 1, 1), Description = "Oranges", Amount = 3.50M };

        //Act
        await _service.Update(userId, entityId, dto);

        //Assert
        Transaction? actual = _database.Transactions.FirstOrDefault(e => e.Id == entityId);
        Assert.NotNull(actual);
        Assert.Equal(entityId, actual.Id);
        Assert.Equal(dto.Description, actual.Description);
        Assert.Equal(dto.Amount, actual.Amount);
    }

    [Fact]
    public async Task Update_WhenNotExists_ShouldThrowException()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        TransactionDto dto = new() { Date = new DateOnly(2026, 1, 1), Description = "Strawberries", Amount = 2.50M };

        //Assert
        await Assert.ThrowsAsync<CustomResourceNotFoundException>(() => _service.Update(userId, Guid.NewGuid(), dto));
    }

    [Fact]
    public async Task Update_WhenCategoryNotExists_ShouldThrowException()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        (Guid entityId, Transaction entity) = TestUtils.CreateTransactionInDatabase(userId, user, _database);
        TransactionDto dto = new() { CategoryId = Guid.NewGuid(), Date = new DateOnly(2026, 1, 1), Description = "Oranges", Amount = 3.50M };

        //Assert
        await Assert.ThrowsAsync<CustomResourceNotFoundException>(() => _service.Update(userId, entityId, dto));
    }

    [Fact]
    public async Task Delete_ShouldRemove()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        (Guid entityId, Transaction entity) = TestUtils.CreateTransactionInDatabase(userId, user, _database);

        //Act
        await _service.Delete(userId, entityId);

        //Assert
        Transaction? actual = _database.Transactions.FirstOrDefault(e => e.Id == entityId);
        Assert.Null(actual);
    }

    [Fact]
    public async Task Delete_WhenNotExists_ShouldThrowException()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);

        //Assert
        await Assert.ThrowsAsync<CustomResourceNotFoundException>(() => _service.Delete(userId, Guid.NewGuid()));
    }

}