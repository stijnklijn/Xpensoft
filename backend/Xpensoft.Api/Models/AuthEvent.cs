namespace Xpensoft.Api.Models;

public class AuthEvent(Guid userId, string? ipAddress, bool isSuccessful) : BaseEntity
{
    public Guid UserId { get; init; } = userId;

    public User User { get; init; } = null!;

    public string? IpAddress { get; init; } = ipAddress;

    public bool IsSuccessful { get; init; } = isSuccessful;
}
