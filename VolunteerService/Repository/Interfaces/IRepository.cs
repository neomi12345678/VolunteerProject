using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.Interfaces
{
    public interface IRepository<T>
    {
        Task<List<T>> GetAll();
        Task<T> GetById(int id);
        Task<T> AddItem(T item);
        Task UpdateItem(int id, T item);
        Task DeleteItem(int id);
        Task<List<T>> Find(string whereClause);
    }
}
