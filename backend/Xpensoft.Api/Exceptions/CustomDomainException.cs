namespace Xpensoft.Api.Exceptions;

public class CustomDomainException(string code) : Exception
{
    public string Code { get; } = code;
}