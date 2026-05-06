namespace Xpensoft.Api.Models;

public class User : BaseEntity
{
    public required string Email { get; set; }

    public required string Password { get; set; }

    public required bool IsLocked { get; set; }

    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public string? Language { get; set; }

    public int? DefaultResultsPerPage { get; set; }

    public IList<AuthEvent> AuthEvents { get; set; } = [];

    public IList<Category> Categories { get; set; } = [];

    public IList<Transaction> Transactions { get; set; } = [];

}