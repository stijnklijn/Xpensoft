using System.Security.Authentication;

using Xpensoft.Api.Exceptions;

namespace Xpensoft.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (InvalidCredentialException ex)
        {
            _logger.LogWarning(ex, "LOGIN__INVALID_CREDENTIALS");
            await WriteError(context, "LOGIN__INVALID_CREDENTIALS", StatusCodes.Status401Unauthorized);
        }
        catch (CustomResourceNotFoundException ex)
        {
            _logger.LogWarning(ex, ex.Code);
            await WriteError(context, ex.Code, StatusCodes.Status404NotFound);
        }
        catch (CustomDuplicateResourceException ex)
        {
            _logger.LogWarning(ex, ex.Code);
            await WriteError(context, ex.Code, StatusCodes.Status409Conflict);
        }
        catch (CustomForeignKeyException ex)
        {
            _logger.LogWarning(ex, ex.Code);
            await WriteError(context, ex.Code, StatusCodes.Status409Conflict);
        }
        catch (CustomDeleteRestrictionException ex)
        {
            _logger.LogWarning(ex, ex.Code);
            await WriteError(context, ex.Code, StatusCodes.Status409Conflict);
        }
        catch (CustomUserIsLockedException ex)
        {
            _logger.LogWarning(ex, ex.Code);
            await WriteError(context, ex.Code, StatusCodes.Status423Locked);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "INTERNAL_SERVER_ERROR");
            await WriteError(context, "INTERNAL_SERVER_ERROR", StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task WriteError(HttpContext context, string code, int status)
    {

        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";

        var response = new
        {
            code,
            timestamp = DateTime.UtcNow
        };

        await context.Response.WriteAsJsonAsync(response);
    }
}