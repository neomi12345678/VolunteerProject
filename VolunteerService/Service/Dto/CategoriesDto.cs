namespace Service.Dto
{
    public class CategoriesDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string? Embedding { get; set; }
    }
}
