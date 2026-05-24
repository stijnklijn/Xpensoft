using System.Net;

using Microsoft.AspNetCore.Mvc;

using Xpensoft.Api.Dtos;
using Xpensoft.Api.Services;

namespace Xpensoft.Api.Controllers;

[ApiController]
[Route("login")]
[Produces("application/json")]
public class LoginController(LoginService service) : ControllerBase
{
    private readonly LoginService _service = service;

    [HttpPost]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto dto)
    {
        IPAddress? ipAddress = HttpContext.Connection.RemoteIpAddress;
        return new LoginResponseDto { Jwt = await _service.Login(dto, ipAddress) };
    }

}