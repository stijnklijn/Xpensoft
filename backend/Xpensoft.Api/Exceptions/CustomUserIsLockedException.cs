namespace Xpensoft.Api.Exceptions;

public class CustomUserIsLockedException : CustomDomainException
{
    public CustomUserIsLockedException(string code) : base(code) { }
}