using System.Net;
using System.Net.Http.Json;

using Xpensoft.Api.Dtos;
using Xpensoft.Api.Services.Pagination;

namespace Xpensoft.IntegrationTests.Controllers;

public class CategoryControllerTests : IClassFixture<XpensoftApiFactory>
{

    private readonly HttpClient _client;

    public CategoryControllerTests(XpensoftApiFactory factory)
    {
        _client = factory.CreateClient();
        factory.ResetDatabase();
    }

    [Fact]
    public async Task Create_ShouldReturnCreated()
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);
        CategoryDto dto = new() { Name = "Groceries", IsIncome = false };

        //Act
        HttpResponseMessage response = await _client.PostAsJsonAsync("/categories", dto);

        //Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        //Act
        CategoryDto? actual = await response.Content.ReadFromJsonAsync<CategoryDto>();

        //Assert
        Assert.NotNull(actual);
        Assert.Equal("Groceries", actual.Name);
    }

    [Theory]
    [MemberData(nameof(InvalidDtos))]
    public async Task Create_WhenInvalidRequestBody_ShouldReturnBadRequest(CategoryDto? dto)
    {
        //Act
        await TestUtils.CreateAndLoginUser(_client);
        HttpResponseMessage response = await _client.PostAsJsonAsync("/categories", dto);

        //Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ReadAll_ShouldReturnOk()
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);
        CategoryDto dto1 = new() { Name = "Salary", IsIncome = true };
        CategoryDto dto2 = new() { Name = "Groceries", IsIncome = false };
        await _client.PostAsJsonAsync("/categories", dto1);
        await _client.PostAsJsonAsync("/categories", dto2);

        //Act
        HttpResponseMessage response = await _client.GetAsync("/categories");

        //Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        //Act
        PageResult<CategoryDto>? actual = await response.Content.ReadFromJsonAsync<PageResult<CategoryDto>>();

        //Assert
        Assert.NotNull(actual);
        Assert.Equal(2, actual.TotalResults);
        Assert.NotNull(actual.Data);
        Assert.Contains(actual.Data, d => d.Name == dto1.Name);
        Assert.Contains(actual.Data, d => d.Name == dto2.Name);
    }

    [Fact]
    public async Task ReadById_ShouldReturnOk()
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);
        CategoryDto? dto = new() { Name = "Groceries", IsIncome = false };
        HttpResponseMessage response = await _client.PostAsJsonAsync("/categories", dto);
        dto = await response.Content.ReadFromJsonAsync<CategoryDto>();
        string? id = dto?.Id.ToString();

        //Act
        response = await _client.GetAsync($"/categories/{id}");

        //Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        //Act
        CategoryDto? actual = await response.Content.ReadFromJsonAsync<CategoryDto>();

        //Assert
        Assert.NotNull(actual);
        Assert.Equal(id, actual.Id.ToString());
        Assert.Equal("Groceries", actual.Name);
    }

    [Fact]
    public async Task ReadById_WhenNotFound_ShouldReturnNotFound()
    {
        //Act
        await TestUtils.CreateAndLoginUser(_client);
        HttpResponseMessage response = await _client.GetAsync($"/categories/{Guid.NewGuid()}");

        //Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_ShouldReturnOk()
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);
        CategoryDto? dto = new() { Name = "Groceries", IsIncome = false };
        HttpResponseMessage response = await _client.PostAsJsonAsync("/categories", dto);
        dto = await response.Content.ReadFromJsonAsync<CategoryDto>();
        string? id = dto?.Id.ToString();
        dto?.Name = "Maintenance";

        //Act
        response = await _client.PutAsJsonAsync($"/categories/{id}", dto);

        //Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        //Act
        CategoryDto? actual = await response.Content.ReadFromJsonAsync<CategoryDto>();

        //Assert
        Assert.NotNull(actual);
        Assert.Equal(id, actual.Id.ToString());
        Assert.Equal("Maintenance", actual.Name);
    }

    [Theory]
    [MemberData(nameof(InvalidDtos))]
    public async Task Update_WhenInvalidRequestBody_ShouldReturnBadRequest(CategoryDto? dto)
    {
        //Act
        await TestUtils.CreateAndLoginUser(_client);
        HttpResponseMessage response = await _client.PutAsJsonAsync($"/categories/{Guid.NewGuid()}", dto);

        //Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Update_WhenNotFound_ShouldReturnNotFound()
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);
        CategoryDto dto = new() { Name = "Groceries", IsIncome = false };

        //Act
        HttpResponseMessage response = await _client.PutAsJsonAsync($"/categories/{Guid.NewGuid()}", dto);

        //Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Delete_ShouldReturnNoContent()
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);
        CategoryDto? dto = new() { Name = "Groceries", IsIncome = false };
        HttpResponseMessage response = await _client.PostAsJsonAsync("/categories", dto);
        dto = await response.Content.ReadFromJsonAsync<CategoryDto>();
        string? id = dto?.Id.ToString();

        //Act
        response = await _client.DeleteAsync($"/categories/{id}");

        //Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        //Act
        response = await _client.DeleteAsync($"/categories/{id}");

        //Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Delete_WhenNotFound_ShouldReturnNotFound()
    {
        //Act
        await TestUtils.CreateAndLoginUser(_client);
        HttpResponseMessage response = await _client.DeleteAsync($"/categories/{Guid.NewGuid()}");

        //Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    public static IEnumerable<object[]> InvalidDtos =>
    [
        [new CategoryDto { Name = "", IsIncome = false }], //Empty name
        [new CategoryDto { Name = "G", IsIncome = false }, //Input too short
    ]];

}