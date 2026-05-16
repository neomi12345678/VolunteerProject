using Microsoft.AspNetCore.Mvc;
using Repository.Entities;
using Repository.Interfaces;

[Route("api/[controller]")]
[ApiController]
public class UserCategoriesController : ControllerBase
{
    private readonly IRepository<UserCategories> _repository;

    public UserCategoriesController(IRepository<UserCategories> repository)
    {
        _repository = repository;
    }

    [HttpPost]
    public async Task<IActionResult> Add(UserCategories item)
    {
        await _repository.AddItem(item);
        return Ok();
    }

    [HttpDelete("{userId}/{categoryId}")]
    public async Task<IActionResult> Delete(int userId, int categoryId)
    {
        var items = await _repository.Find($"{userId}-{categoryId}");
        var item = items.FirstOrDefault();
        if (item != null)
        {
            await _repository.DeleteItem(item.Id);
        }
        return Ok();
    }
}
