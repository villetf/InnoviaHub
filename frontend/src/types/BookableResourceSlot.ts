import { ResourceItem } from "../app/components/ResourceMenu/models/Resource";

export interface BookableResourceSlot extends ResourceItem {
  time: Date
}