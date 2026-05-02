namespace Xpensoft.Api.Exceptions;

public class CustomDuplicateResourceException : CustomDomainException
{
    public CustomDuplicateResourceException(string code) : base(code) { }
}