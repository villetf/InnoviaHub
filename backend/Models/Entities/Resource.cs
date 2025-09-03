using System;

namespace backend.Models.Entities;

public class Resource
{
   public int Id { get; set; }
   public required string Name { get; set; }
   public ResourceType? ResourceType { get; set; }
   public required int ResourceTypeId { get; set; }
   public DateTime CreatedAt { get; set; } = DateTime.Now;
}
