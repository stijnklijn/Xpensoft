using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

using Xpensoft.Api.Data;

namespace Xpensoft.IntegrationTests;

public class XpensoftApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("IntegrationTests");
    }

    public void ResetDatabase()
    {
        using var scope = Services.CreateScope();
        var database = scope.ServiceProvider.GetRequiredService<XpensoftDbContext>();
        database.Database.EnsureDeleted();
        database.Database.EnsureCreated();
    }

}