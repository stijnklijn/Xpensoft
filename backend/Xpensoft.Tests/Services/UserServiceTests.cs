using AutoMapper;

using Microsoft.AspNetCore.Identity;

using Xpensoft.Api.Data;
using Xpensoft.Api.Dtos;
using Xpensoft.Api.Exceptions;
using Xpensoft.Api.Models;
using Xpensoft.Api.Services;
using Xpensoft.Tests.TestFactories;

namespace Xpensoft.Tests.Services;

public class UserServiceTests
{

    private readonly XpensoftDbContext _database;
    private readonly IMapper _mapper;
    private readonly UserService _service;

    public UserServiceTests()
    {
        _database = TestUtils.CreateDbContext();
        _mapper = TestUtils.CreateMapper();
        _service = new UserService(_database, _mapper, new PasswordHasher<User>());
    }

    [Fact]
    public async Task Exists_ShouldReturnCorrectResponse()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        UserExistsRequestDto request1 = new() { Email = "stijnklijn@gmail.com" };
        UserExistsRequestDto request2 = new() { Email = "notexists@gmail.com" };

        //Act
        UserExistsResponseDto response1 = await _service.Exists(request1);
        UserExistsResponseDto response2 = await _service.Exists(request2);

        //Assert
        Assert.True(response1.Exists);
        Assert.False(response2.Exists);
    }

    [Fact]
    public async Task Create_ShouldSave()
    {
        //Arrange
        UserCreateRequestDto dto = new() { Email = "stijnklijn@gmail.com", Password = "Test1234!", FirstName = "Stijn", LastName = "Klijn" };

        //Act
        await _service.Create(dto);

        //Assert
        User? actual = _database.Users.FirstOrDefault(e => e.Email == "stijnklijn@gmail.com");
        Assert.NotNull(actual);
        Assert.Equal(dto.Email, actual.Email);
    }

    [Fact]
    public async Task Create_WhenUserEmailAlreadyExists_ShouldThrowException()
    {
        //Arrange
        User existingUser = new() { Email = "stijnklijn@gmail.com", Password = "Test1234!", FirstName = "Stijn", LastName = "Klijn", IsLocked = false };
        _database.Add(existingUser);
        _database.SaveChanges();
        UserCreateRequestDto dto = new() { Email = "stijnklijn@gmail.com", Password = "Test1234!", FirstName = "Stijn", LastName = "Klijn" };

        //Assert
        await Assert.ThrowsAsync<CustomDuplicateResourceException>(() => _service.Create(dto));
    }

    [Fact]
    public async Task ReadById_ShouldReturnOne()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);

        //Act
        UserResponseDto actual = await _service.ReadById(userId);

        //Assert
        Assert.NotNull(actual);
        Assert.Equal(user.Id, actual.Id);
    }

    [Fact]
    public async Task ReadById_WhenNotExists_ShouldThrowException()
    {
        //Assert
        await Assert.ThrowsAsync<CustomResourceNotFoundException>(() => _service.ReadById(Guid.NewGuid()));
    }

    [Fact]
    public async Task Update_ShouldSave()
    {
        //Arrange
        (Guid userId, User user) = TestUtils.CreateUserInDatabase(_database);
        UserUpdateRequestDto dto = new() { FirstName = "Stijn", LastName = "Klijn", Language = "nl", DefaultResultsPerPage = 200 };

        //Act
        await _service.Update(userId, dto);

        //Assert
        User? actual = _database.Users.FirstOrDefault(e => e.Id == userId);
        Assert.NotNull(actual);
        Assert.Equal(userId, actual.Id);
        Assert.Equal(dto.FirstName, actual.FirstName);
        Assert.Equal(dto.LastName, actual.LastName);
        Assert.Equal(dto.Language, actual.Language);
        Assert.Equal(dto.DefaultResultsPerPage, actual.DefaultResultsPerPage);
    }

}