namespace Xpensoft.Api.Exceptions;

public class CustomForeignKeyException : CustomDomainException
{
    public CustomForeignKeyException(string code) : base(code) { }
}