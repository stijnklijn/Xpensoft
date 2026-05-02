namespace Xpensoft.Api.Exceptions;

public class CustomDeleteRestrictionException : CustomDomainException
{
    public CustomDeleteRestrictionException(string code) : base(code) { }
}