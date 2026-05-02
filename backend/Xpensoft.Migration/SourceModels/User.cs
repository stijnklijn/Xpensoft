namespace Xpensoft.Migration.SourceModels;

public class User : BaseEntity
{
    public required string Email { get; set; }

    public required string Password { get; set; }

}