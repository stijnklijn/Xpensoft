using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using Xpensoft.Api.Data;

namespace Xpensoft.IntegrationTests;

public class XpensoftApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("IntegrationTests");

        builder.ConfigureServices(services =>
        {
            ServiceDescriptor? descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<XpensoftDbContext>));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            DbContextOptions<XpensoftDbContext> options = new DbContextOptionsBuilder<XpensoftDbContext>()
                .UseInMemoryDatabase("IntegrationTestsDatabase")
                .Options;
            services.AddSingleton(options);
        });
    }

    public void ResetDatabase()
    {
        using var scope = Services.CreateScope();
        var database = scope.ServiceProvider.GetRequiredService<XpensoftDbContext>();
        database.Database.EnsureDeleted();
        database.Database.EnsureCreated();
    }

}