using Sieve.Attributes;

namespace Xpensoft.Api.Models;

public class Transaction : BaseEntity
{
    public required Guid UserId { get; set; }

    public required User User { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? CategoryId { get; set; }

    public Category? Category { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public required DateOnly Date { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public required string Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public required decimal Amount { get; set; }
}