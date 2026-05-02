using System.Net;
using System.Net.Http.Json;

using Xpensoft.Api.Dtos;
using Xpensoft.Api.Services.Pagination;

namespace Xpensoft.IntegrationTests.Controllers;

public class TransactionControllerTests : IClassFixture<XpensoftApiFactory>
{

    private readonly HttpClient _client;

    public TransactionControllerTests(XpensoftApiFactory factory)
    {
        _client = factory.CreateClient();
        factory.ResetDatabase();
    }

    [Fact]
    public async Task Create_ShouldReturnCreated()
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);
        TransactionDto dto = new() { Date = new DateOnly(2026, 1, 1), Description = "Strawberries", Amount = 2.50M };

        //Act
        HttpResponseMessage response = await _client.PostAsJsonAsync("/transactions", dto);

        //Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        //Act
        TransactionDto? actual = await response.Content.ReadFromJsonAsync<TransactionDto>();

        //Assert
        Assert.NotNull(actual);
        Assert.Equal("Strawberries", actual.Description);
    }

    [Theory]
    [MemberData(nameof(InvalidDtos))]
    public async Task Create_WhenInvalidRequestBody_ShouldReturnBadRequest(TransactionDto? dto)
    {
        //Act
        await TestUtils.CreateAndLoginUser(_client);
        HttpResponseMessage response = await _client.PostAsJsonAsync("/transactions", dto);

        //Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ReadAll_ShouldReturnOk()
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);
        TransactionDto dto1 = new() { Date = new DateOnly(2026, 1, 1), Description = "Strawberries", Amount = 2.50M };
        TransactionDto dto2 = new() { Date = new DateOnly(2026, 1, 1), Description = "Oranges", Amount = 3.50M };
        await _client.PostAsJsonAsync("/transactions", dto1);
        await _client.PostAsJsonAsync("/transactions", dto2);

        //Act
        HttpResponseMessage response = await _client.GetAsync("/transactions");

        //Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        //Act
        PageResult<TransactionDto>? actual = await response.Content.ReadFromJsonAsync<PageResult<TransactionDto>>();

        //Assert
        Assert.NotNull(actual);
        Assert.Equal(2, actual.TotalResults);
        Assert.NotNull(actual.Data);
        Assert.Contains(actual.Data, d => d.Description == dto1.Description);
        Assert.Contains(actual.Data, d => d.Description == dto2.Description);
    }

    [Fact]
    public async Task ReadById_ShouldReturnOk()
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);
        TransactionDto? dto = new() { Date = new DateOnly(2026, 1, 1), Description = "Strawberries", Amount = 2.50M };
        HttpResponseMessage response = await _client.PostAsJsonAsync("/transactions", dto);
        dto = await response.Content.ReadFromJsonAsync<TransactionDto>();
        string? id = dto?.Id.ToString();

        //Act
        response = await _client.GetAsync($"/transactions/{id}");

        //Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        //Act
        TransactionDto? actual = await response.Content.ReadFromJsonAsync<TransactionDto>();

        //Assert
        Assert.NotNull(actual);
        Assert.Equal(id, actual.Id.ToString());
        Assert.Equal("Strawberries", actual.Description);
    }

    [Fact]
    public async Task ReadById_WhenNotFound_ShouldReturnNotFound()
    {
        //Act
        await TestUtils.CreateAndLoginUser(_client);
        HttpResponseMessage response = await _client.GetAsync($"/transactions/{Guid.NewGuid()}");

        //Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_ShouldReturnOk()
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);
        TransactionDto? dto = new() { Date = new DateOnly(2026, 1, 1), Description = "Strawberries", Amount = 2.50M };
        HttpResponseMessage response = await _client.PostAsJsonAsync("/transactions", dto);
        dto = await response.Content.ReadFromJsonAsync<TransactionDto>();
        string? id = dto?.Id.ToString();
        dto?.Description = "Oranges";

        //Act
        response = await _client.PutAsJsonAsync($"/transactions/{id}", dto);

        //Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        //Act
        TransactionDto? actual = await response.Content.ReadFromJsonAsync<TransactionDto>();

        //Assert
        Assert.NotNull(actual);
        Assert.Equal(id, actual.Id.ToString());
        Assert.Equal("Oranges", actual.Description);
    }

    [Theory]
    [MemberData(nameof(InvalidDtos))]
    public async Task Update_WhenInvalidRequestBody_ShouldReturnBadRequest(TransactionDto? dto)
    {
        //Act
        await TestUtils.CreateAndLoginUser(_client);
        HttpResponseMessage response = await _client.PutAsJsonAsync($"/transactions/{Guid.NewGuid()}", dto);

        //Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Update_WhenNotFound_ShouldReturnNotFound()
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);
        TransactionDto dto = new() { Date = new DateOnly(2026, 1, 1), Description = "Strawberries", Amount = 2.50M };

        //Act
        HttpResponseMessage response = await _client.PutAsJsonAsync($"/transactions/{Guid.NewGuid()}", dto);

        //Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Delete_ShouldReturnNoContent()
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);
        TransactionDto? dto = new() { Date = new DateOnly(2026, 1, 1), Description = "Strawberries", Amount = 2.50M };
        HttpResponseMessage response = await _client.PostAsJsonAsync("/transactions", dto);
        dto = await response.Content.ReadFromJsonAsync<TransactionDto>();
        string? id = dto?.Id.ToString();

        //Act
        response = await _client.DeleteAsync($"/transactions/{id}");

        //Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        //Act
        response = await _client.DeleteAsync($"/transactions/{id}");

        //Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Delete_WhenNotFound_ShouldReturnNotFound()
    {
        //Act
        await TestUtils.CreateAndLoginUser(_client);
        HttpResponseMessage response = await _client.DeleteAsync($"/transactions/{Guid.NewGuid()}");

        //Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    public static IEnumerable<object[]> InvalidDtos =>
    [
        [new TransactionDto { Date = new DateOnly(2026, 1, 1), Description = "S", Amount = 2.50M }], //Input too short
        [new TransactionDto { Date = new DateOnly(2026, 1, 1), Description = "Strawberries", Amount = 0.00M }], //Input too small
        [new TransactionDto { Date = new DateOnly(2026, 1, 1), Description = "Strawberries", Amount = 1_000_000.00M } //Input too large
    ]];

}