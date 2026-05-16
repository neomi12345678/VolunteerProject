using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Repository.Entities;

namespace Repository.Entities
{
    public class UserCategories
    {
        public int Id { get; set; }

        [ForeignKey("Users")]
        public int UserID { get; set; }

        [ForeignKey("Categories")]
        public int CategoryID { get; set; }
    }
}
