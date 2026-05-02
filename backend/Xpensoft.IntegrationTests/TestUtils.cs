using System.Net.Http.Json;

using Xpensoft.Api.Dtos;

namespace Xpensoft.IntegrationTests;

public static class TestUtils
{

    public static async Task CreateAndLoginUser(HttpClient client)
    {
        UserCreateRequestDto dto = new() { Email = "stijnklijn@gmail.com", Password = "Test1234!", FirstName = "Stijn", LastName = "Klijn" };
        await client.PostAsJsonAsync("/users", dto);
        LoginRequestDto loginDto = new() { Email = "stijnklijn@gmail.com", Password = "Test1234!" };
        HttpResponseMessage response = await client.PostAsJsonAsync("/login", loginDto);
        LoginResponseDto? loginReponse = await response.Content.ReadFromJsonAsync<LoginResponseDto>();
        string jwt = loginReponse!.Jwt;
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", jwt);
    }

}