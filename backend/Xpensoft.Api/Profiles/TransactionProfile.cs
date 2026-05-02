using AutoMapper;

using Xpensoft.Api.Dtos;
using Xpensoft.Api.Models;

namespace Xpensoft.Api.Profiles;

public class TransactionProfile : Profile
{
    public TransactionProfile()
    {
        CreateMap<Transaction, TransactionDto>();

        CreateMap<TransactionDto, Transaction>().ForMember(dest => dest.Id, opt => opt.Ignore());
    }

}