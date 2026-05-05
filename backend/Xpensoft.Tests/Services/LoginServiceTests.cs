using System.Net;
using System.Security.Authentication;

using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

using Xpensoft.Api.Data;
using Xpensoft.Api.Dtos;
using Xpensoft.Api.Exceptions;
using Xpensoft.Api.Models;
using Xpensoft.Api.Services;
using Xpensoft.Tests.TestFactories;

namespace Xpensoft.Tests.Services;

public class LoginServiceTests
{

    private readonly XpensoftDbContext _database;
    private readonly IConfiguration _config;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly LoginService _service;

    public LoginServiceTests()
    {
        Environment.SetEnvironmentVariable("Jwt:Key", "2ac2715a-d8ff-4860-b0b3-099d6988cfec");
        Environment.SetEnvironmentVariable("Jwt:Issuer", "Xpensoft");

        _database = TestUtils.CreateDbContext();
        _config = new ConfigurationBuilder().AddEnvironmentVariables().Build();
        _passwordHasher = new PasswordHasher<User>();
        _service = new LoginService(_database, _config, _passwordHasher);
    }

    [Fact]
    public async Task Login_ShouldReturnJwt()
    {
        //Arrange
        CreateUserInDatabase(false);
        LoginRequestDto dto = new() { Email = "stijnklijn@gmail.com", Password = "Test1234!" };

        //Act
        string jwt = await _service.Login(dto, IPAddress.Parse("127.0.0.1"));

        //Assert
        Assert.NotNull(jwt);
    }

    [Fact]
    public async Task Login_WhenUserNotExists_ShouldThrowException()
    {
        //Arrange
        LoginRequestDto dto = new() { Email = "stijnklijn@gmail.com", Password = "Test1234!" };

        //Assert
        await Assert.ThrowsAsync<InvalidCredentialException>(() => _service.Login(dto, IPAddress.Parse("127.0.0.1")));
    }

    [Fact]
    public async Task Login_WhenInvalidPassword_ShouldThrowException()
    {
        //Arrange
        CreateUserInDatabase(false);
        LoginRequestDto dto = new() { Email = "stijnklijn@gmail.com", Password = "Test1234?" };

        //Assert
        await Assert.ThrowsAsync<InvalidCredentialException>(() => _service.Login(dto, IPAddress.Parse("127.0.0.1")));
    }

    [Fact]
    public async Task Login_WhenUserIsLocked_ShouldThrowException()
    {
        //Arrange
        CreateUserInDatabase(true);
        LoginRequestDto dto = new() { Email = "stijnklijn@gmail.com", Password = "Test1234!" };

        //Assert
        await Assert.ThrowsAsync<CustomUserIsLockedException>(() => _service.Login(dto, IPAddress.Parse("127.0.0.1")));
    }

    private void CreateUserInDatabase(bool isLocked)
    {
        Guid userId = Guid.NewGuid();
        User user = new() { Id = userId, Email = "stijnklijn@gmail.com", Password = "Test1234!", FirstName = "Stijn", LastName = "Klijn", IsLocked = isLocked };
        user.Password = _passwordHasher.HashPassword(user, user.Password);
        _database.Add(user);
        _database.SaveChanges();
    }

}