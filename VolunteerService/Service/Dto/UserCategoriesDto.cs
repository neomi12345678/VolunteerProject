using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Dto
{
    public class UserCategoriesDto
    {
        public int Id { get; set; }
        public int UserID { get; set; }
        public int CategoryID { get; set; }
    }
}
