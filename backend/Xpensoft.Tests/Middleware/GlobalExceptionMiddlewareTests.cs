namespace Xpensoft.Tests.Middleware;

using System;
using System.Security.Authentication;
using System.Text.Json;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

using Moq;

using Xpensoft.Api.Exceptions;
using Xpensoft.Api.Middleware;

using Xunit;

public class GlobalExceptionMiddlewareTests
{

    private readonly Mock<ILogger<GlobalExceptionMiddleware>> _logger = new();
    private readonly DefaultHttpContext _context = new();

    [Fact]
    public async Task InvokeAsync_WhenInvalidCredentialException_ShouldReturnCorrectJson()
    {
        // Arrange
        _context.Response.Body = new MemoryStream();
        static Task next(HttpContext ctx) => throw new InvalidCredentialException();
        GlobalExceptionMiddleware middleware = new(next, _logger.Object);

        // Act
        await middleware.InvokeAsync(_context);

        // Assert
        Assert.Equal(StatusCodes.Status401Unauthorized, _context.Response.StatusCode);

        _context.Response.Body.Seek(0, SeekOrigin.Begin);

        using JsonDocument document = await JsonDocument.ParseAsync(_context.Response.Body);
        JsonElement root = document.RootElement;

        Assert.Equal("LOGIN__INVALID_CREDENTIALS", root.GetProperty("code").GetString());
    }

    [Fact]
    public async Task InvokeAsync_WhenCustomDuplicateResourceException_ShouldReturnCorrectJson()
    {
        // Arrange
        _context.Response.Body = new MemoryStream();
        static Task next(HttpContext ctx) => throw new CustomDuplicateResourceException("USER__EMAIL_ALREADY_EXISTS");
        GlobalExceptionMiddleware middleware = new(next, _logger.Object);

        // Act
        await middleware.InvokeAsync(_context);

        // Assert
        Assert.Equal(StatusCodes.Status409Conflict, _context.Response.StatusCode);

        _context.Response.Body.Seek(0, SeekOrigin.Begin);

        using JsonDocument document = await JsonDocument.ParseAsync(_context.Response.Body);
        JsonElement root = document.RootElement;

        Assert.Equal("USER__EMAIL_ALREADY_EXISTS", root.GetProperty("code").GetString());
    }

    [Fact]
    public async Task InvokeAsync_WhenCustomResourceNotFoundException_ShouldReturnCorrectJson()
    {
        // Arrange
        _context.Response.Body = new MemoryStream();
        static Task next(HttpContext ctx) => throw new CustomResourceNotFoundException("USER__NOT_FOUND");
        GlobalExceptionMiddleware middleware = new(next, _logger.Object);

        // Act
        await middleware.InvokeAsync(_context);

        // Assert
        Assert.Equal(StatusCodes.Status404NotFound, _context.Response.StatusCode);

        _context.Response.Body.Seek(0, SeekOrigin.Begin);

        using JsonDocument document = await JsonDocument.ParseAsync(_context.Response.Body);
        JsonElement root = document.RootElement;

        Assert.Equal("USER__NOT_FOUND", root.GetProperty("code").GetString());
    }

    [Fact]
    public async Task InvokeAsync_WhenCustomForeignKeyException_ShouldReturnCorrectJson()
    {
        // Arrange
        _context.Response.Body = new MemoryStream();
        static Task next(HttpContext ctx) => throw new CustomForeignKeyException("INVALID_FOREIGN_KEY");
        GlobalExceptionMiddleware middleware = new(next, _logger.Object);

        // Act
        await middleware.InvokeAsync(_context);

        // Assert
        Assert.Equal(StatusCodes.Status409Conflict, _context.Response.StatusCode);

        _context.Response.Body.Seek(0, SeekOrigin.Begin);

        using JsonDocument document = await JsonDocument.ParseAsync(_context.Response.Body);
        JsonElement root = document.RootElement;

        Assert.Equal("INVALID_FOREIGN_KEY", root.GetProperty("code").GetString());
    }

    [Fact]
    public async Task InvokeAsync_WhenCustomDeleteRestrictionException_ShouldReturnCorrectJson()
    {
        // Arrange
        _context.Response.Body = new MemoryStream();
        static Task next(HttpContext ctx) => throw new CustomDeleteRestrictionException("CATEGORY__HOLDS_TRANSACTIONS");
        GlobalExceptionMiddleware middleware = new(next, _logger.Object);

        // Act
        await middleware.InvokeAsync(_context);

        // Assert
        Assert.Equal(StatusCodes.Status409Conflict, _context.Response.StatusCode);

        _context.Response.Body.Seek(0, SeekOrigin.Begin);

        using JsonDocument document = await JsonDocument.ParseAsync(_context.Response.Body);
        JsonElement root = document.RootElement;

        Assert.Equal("CATEGORY__HOLDS_TRANSACTIONS", root.GetProperty("code").GetString());
    }

    [Fact]
    public async Task InvokeAsync_WhenGenericException_ShouldReturnCorrectJson()
    {
        // Arrange
        _context.Response.Body = new MemoryStream();
        static Task next(HttpContext ctx) => throw new Exception();
        GlobalExceptionMiddleware middleware = new(next, _logger.Object);

        // Act
        await middleware.InvokeAsync(_context);

        // Assert
        Assert.Equal(StatusCodes.Status500InternalServerError, _context.Response.StatusCode);

        _context.Response.Body.Seek(0, SeekOrigin.Begin);

        using JsonDocument document = await JsonDocument.ParseAsync(_context.Response.Body);
        JsonElement root = document.RootElement;

        Assert.Equal("INTERNAL_SERVER_ERROR", root.GetProperty("code").GetString());
    }

}