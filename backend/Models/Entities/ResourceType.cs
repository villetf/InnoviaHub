using System;

namespace backend.Models.Entities;

public class ResourceType
{
   public int Id { get; set; }
   public required string Name { get; set; }
   public DateTime CreatedAt { get; set; } = DateTime.Now;
}
