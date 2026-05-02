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

public class CategoryServiceTests
{

    private readonly XpensoftDbContext _database;
    private readonly SieveProcessor _sieveProcessor;
    private readonly IMapper _mapper;
    private readonly CategoryService _service;

    public CategoryServiceTests()
    {
        _database = TestUtils.CreateDbContext();
        _mapper = TestUtils.CreateMapper();
        _sieveProcessor = TestUtils.CreateSieveProcessor();
        _service = new CategoryService(_database, _sieveProcessor, _mapper);
    }

    [Fact]
    public async Task Create_ShouldSave()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        CategoryDto dto = new() { Name = "Groceries", IsIncome = false };

        //Act
        await _service.Create(userId, dto);

        //Assert
        Category? actual = _database.Categories.FirstOrDefault(e => e.Name == "Groceries");
        Assert.NotNull(actual);
        Assert.Equal(dto.Name, actual.Name);
    }

    [Fact]
    public async Task Create_WhenCategoryNameAlreadyExists_ShouldThrowException()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        Category existingCategory = new() { UserId = userId, User = user, Name = "Groceries", IsIncome = false };
        _database.Add<Category>(existingCategory);
        _database.SaveChanges();
        CategoryDto dto = new() { Name = "Groceries", IsIncome = false };

        //Assert
        await Assert.ThrowsAsync<CustomDuplicateResourceException>(() => _service.Create(userId, dto));
    }

    [Fact]
    public async Task ReadAll_ShouldReturnAll()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        Category entity1 = new() { UserId = userId, User = user, Name = "Salary", IsIncome = true };
        Category entity2 = new() { UserId = userId, User = user, Name = "Groceries", IsIncome = false };
        _database.Add<Category>(entity1);
        _database.Add<Category>(entity2);
        _database.SaveChanges();

        //Act
        PageResult<CategoryDto> actual = await _service.ReadAll(userId, new SieveModel());

        //Assert
        Assert.NotNull(actual);
        Assert.Equal(2, actual.TotalResults);
        Assert.NotNull(actual.Data);
        Assert.Contains(actual.Data, d => d.Name == entity1.Name);
        Assert.Contains(actual.Data, d => d.Name == entity2.Name);
    }

    [Fact]
    public async Task ReadById_ShouldReturnOne()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        (Guid entityId, Category entity) = TestUtils.CreateCategoryInDatabase(userId, user, _database);

        //Act
        CategoryDto actual = await _service.ReadById(userId, entityId);

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
        (Guid entityId, Category entity) = TestUtils.CreateCategoryInDatabase(userId, user, _database);
        CategoryDto dto = new() { Name = "Maintenance", IsIncome = false };

        //Act
        await _service.Update(userId, entityId, dto);

        //Assert
        Category? actual = _database.Categories.FirstOrDefault(e => e.Id == entityId);
        Assert.NotNull(actual);
        Assert.Equal(entityId, actual.Id);
        Assert.Equal(dto.Name, actual.Name);
    }

    [Fact]
    public async Task Update_WhenNotExists_ShouldThrowException()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        CategoryDto dto = new() { Name = "Maintenance", IsIncome = false };

        //Assert
        await Assert.ThrowsAsync<CustomResourceNotFoundException>(() => _service.Update(userId, Guid.NewGuid(), dto));
    }

    [Fact]
    public async Task Update_WhenCategoryNameAlreadyExists_ShouldThrowException()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        Category existingCategory = new() { UserId = userId, User = user, Name = "Maintenance", IsIncome = false };
        _database.Add<Category>(existingCategory);
        _database.SaveChanges();
        (Guid entityId, Category entity) = TestUtils.CreateCategoryInDatabase(userId, user, _database);
        CategoryDto dto = new() { Name = "Maintenance", IsIncome = false };

        //Assert
        await Assert.ThrowsAsync<CustomDuplicateResourceException>(() => _service.Update(userId, entityId, dto));
    }

    [Fact]
    public async Task Delete_ShouldRemove()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        (Guid entityId, Category entity) = TestUtils.CreateCategoryInDatabase(userId, user, _database);

        //Act
        await _service.Delete(userId, entityId);

        //Assert
        Category? actual = _database.Categories.FirstOrDefault(e => e.Id == entityId);
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

    [Fact]
    public async Task Delete_WhenCategoryHoldsTransactions_ShouldThrowException()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        (Guid entityId, Category entity) = TestUtils.CreateCategoryInDatabase(userId, user, _database);
        Transaction transaction = new() { UserId = userId, User = user, CategoryId = entityId, Date = new DateOnly(2026, 1, 1), Description = "Strawberries", Amount = 2.50M };
        _database.Add<Transaction>(transaction);
        _database.SaveChanges();

        //Assert
        await Assert.ThrowsAsync<CustomDeleteRestrictionException>(() => _service.Delete(userId, entityId));
    }

}