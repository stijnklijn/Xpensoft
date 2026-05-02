namespace Xpensoft.Api.Exceptions;

public class CustomResourceNotFoundException : CustomDomainException
{
    public CustomResourceNotFoundException(string code) : base(code) { }
}