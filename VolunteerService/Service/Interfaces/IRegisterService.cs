using Repository.Entities;
using Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IRegisterService
    {
        Task<UsersDto> Register(RegisterDto register);
    }
}
