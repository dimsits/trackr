export type Id = string;

export type DragCardData = {
  type: "card";
  appId: Id;
  fromStageId: Id;
};

export type DragColumnData = {
  type: "column";
  stageId: Id;
};
