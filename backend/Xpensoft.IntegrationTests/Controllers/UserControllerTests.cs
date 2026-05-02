using System.Net;
using System.Net.Http.Json;

using Xpensoft.Api.Dtos;

namespace Xpensoft.IntegrationTests.Controllers;

public class UserControllerTests : IClassFixture<XpensoftApiFactory>
{

    private readonly HttpClient _client;

    public UserControllerTests(XpensoftApiFactory factory)
    {
        _client = factory.CreateClient();
        factory.ResetDatabase();
    }

    [Fact]
    public async Task Exists_ShouldReturnOk()
    {
        //Arrange
        UserExistsRequestDto dto = new() { Email = "stijnklijn@gmail.com" };

        //Act
        HttpResponseMessage response = await _client.PostAsJsonAsync("/users/exists", dto);

        //Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Create_ShouldReturnCreated()
    {
        //Arrange
        UserCreateRequestDto dto = new() { Email = "stijnklijn@gmail.com", Password = "Test1234!", FirstName = "Stijn", LastName = "Klijn" };

        //Act
        HttpResponseMessage response = await _client.PostAsJsonAsync("/users", dto);

        //Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Theory]
    [MemberData(nameof(InvalidUserCreateRequestDtos))]
    public async Task Create_WhenInvalidRequestBody_ShouldReturnBadRequest(UserCreateRequestDto? dto)
    {
        //Act
        HttpResponseMessage response = await _client.PostAsJsonAsync("/users", dto);

        //Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ReadById_ShouldReturnOk()
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);

        //Act
        HttpResponseMessage response = await _client.GetAsync("/users");

        //Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        //Act
        UserResponseDto? actual = await response.Content.ReadFromJsonAsync<UserResponseDto>();

        //Assert
        Assert.NotNull(actual);
        Assert.Equal("stijnklijn@gmail.com", actual.Email);
    }

    [Fact]
    public async Task Update_ShouldReturnOk()
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);
        UserUpdateRequestDto? dto = new() { FirstName = "Stijn", LastName = "Klijn", Language = "nl", DefaultResultsPerPage = 200 };

        //Act
        HttpResponseMessage response = await _client.PutAsJsonAsync("/users", dto);

        //Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Theory]
    [MemberData(nameof(InvalidUserUpdateRequestDtos))]
    public async Task Update_WhenInvalidRequestBody_ShouldReturnBadRequest(UserUpdateRequestDto? dto)
    {
        //Arrange
        await TestUtils.CreateAndLoginUser(_client);

        //Act
        HttpResponseMessage response = await _client.PutAsJsonAsync("/users", dto);

        //Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    public static IEnumerable<object[]> InvalidUserCreateRequestDtos =>
    [
        [new UserCreateRequestDto { Email = null!, Password = "Test1234!", FirstName = "Stijn", LastName = "Klijn" }], //Missing required field
        [new UserCreateRequestDto { Email = "stijnklijn@gmail.com", Password = null!, FirstName = "Stijn", LastName = "Klijn" }], //Missing required field
        [new UserCreateRequestDto { Email = "stijnklijn@gmail.com", Password = "Test1234!", FirstName = null!, LastName = "Klijn" }], //Missing required field
        [new UserCreateRequestDto { Email = "stijnklijn@gmail.com", Password = "Test1234!", FirstName = "Stijn", LastName = null! }], //Missing required field
        [new UserCreateRequestDto { Email = "stijnklijn", Password = "Test1234!", FirstName = "Stijn", LastName = "Klijn" }], //Invalid email
        [new UserCreateRequestDto { Email = "stijnklijn@gmail.com", Password = "Test1234", FirstName = "Stijn", LastName = "Klijn" }], //Invalid password
        [new UserCreateRequestDto { Email = "stijnklijn@gmail.com", Password = "Test!", FirstName = "Stijn", LastName = "Klijn" }], //Invalid password
        [new UserCreateRequestDto { Email = "stijnklijn@gmail.com", Password = "1234!", FirstName = "Stijn", LastName = "Klijn" }], //Invalid password
        [new UserCreateRequestDto { Email = "stijnklijn@gmail.com", Password = "Te1!", FirstName = "Stijn", LastName = "Klijn" }], //Invalid password
        [new UserCreateRequestDto { Email = "stijnklijn@gmail.com", Password = "Test1234!", FirstName = "S", LastName = "Klijn" }], //Input too short
        [new UserCreateRequestDto { Email = "stijnklijn@gmail.com", Password = "Test1234!", FirstName = "Stijn", LastName = "K" }] //Input too short
    ];

    public static IEnumerable<object[]> InvalidUserUpdateRequestDtos =>
    [
        [new UserUpdateRequestDto { FirstName = null!, LastName = "Klijn" }], //Missing required field
        [new UserUpdateRequestDto { FirstName = "Stijn", LastName = null! }], //Missing required field
        [new UserUpdateRequestDto { FirstName = "S", LastName = "Klijn" }], //Input too short
        [new UserUpdateRequestDto { FirstName = "Stijn", LastName = "K" }], //Input too short
        [new UserUpdateRequestDto { FirstName = "Stijn", LastName = "Klijn", Language = "es" }], //Unsupported language
        [new UserUpdateRequestDto { FirstName = "Stijn", LastName = "Klijn", DefaultResultsPerPage = 5 }], //Unsupported value
        [new UserUpdateRequestDto { FirstName = "Stijn", LastName = "Klijn", DefaultResultsPerPage = 2000 }] //Unsupported value
    ];

}