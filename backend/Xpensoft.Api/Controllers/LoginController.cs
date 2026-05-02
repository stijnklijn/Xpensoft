using Microsoft.AspNetCore.Mvc;

using Xpensoft.Api.Dtos;
using Xpensoft.Api.Services;

namespace Xpensoft.Api.Controllers;

[ApiController]
[Route("login")]
public class LoginController(LoginService service) : ControllerBase
{
    private readonly LoginService _service = service;

    [HttpPost]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto dto)
    {
        return new LoginResponseDto { Jwt = await _service.Login(dto) };
    }

}