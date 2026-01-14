// import apiServer from "../server";
// import proxy from "@/config/host";

// const env = import.meta.env.MODE || "development";

const apiServer = {
  stystem: "dp-app",
  engine:""// (window as any).appConfig.engineServerName
};

export const engineApi = {

  FileRecentFiles: `${apiServer.engine}/File/RecentFiles`,

  addMergeByConvertProject: `${apiServer.engine}/mergeModel/addMergeByConvertProject`,
  getMergeModelByProject: `${apiServer.engine}/mergeModel/getMergeModelByProject`,
  getMergeFileUrl: `${apiServer.engine}/mergeModel/getMergeFileUrl`,

  convertModelSelectTreeNodesByName: `${apiServer.engine}/convertModel/selectTreeNodesByName`,

  listEngineProject: `${apiServer.engine}/engineProject/list`,
  getEngineProject: `${apiServer.engine}/engineProject/`, // +id
  addEngineProject: `${apiServer.engine}/engineProject/save`,
  updateEngineProject: `${apiServer.engine}/engineProject/update`,
  deleteEngineProject: `${apiServer.engine}/engineProject/deleteById`,
  pageEngineProject: `${apiServer.engine}/engineProject/page`,

  addEngineServer: `${apiServer.engine}/engineServer/save`,
  getEngineServer: `${apiServer.engine}/engineServer/`, // +id
  updateEngineServer: `${apiServer.engine}/engineServer/update`,
  listEngineServer: `${apiServer.engine}/engineServer/list`,
  pageEngineServer: `${apiServer.engine}/engineServer/page`,
  deleteEngineServer: `${apiServer.engine}/engineServer/deleteById`,

  addEngineSrsServer: `${apiServer.engine}/engineSrsServer/save`,
  getEngineSrsServer: `${apiServer.engine}/engineSrsServer/`, // +id
  updateEngineSrsServer: `${apiServer.engine}/engineSrsServer/update`,
  listEngineSrsServer: `${apiServer.engine}/engineSrsServer/list`,
  pageEngineSrsServer: `${apiServer.engine}/engineSrsServer/page`,
  deleteEngineSrsServer: `${apiServer.engine}/engineSrsServer/deleteById`,

  addEngineCmdServer: `${apiServer.engine}/engineCmdServer/save`,
  getEngineCmdServer: `${apiServer.engine}/engineCmdServer/`, // +id
  updateEngineCmdServer: `${apiServer.engine}/engineCmdServer/update`,
  listEngineCmdServer: `${apiServer.engine}/engineCmdServer/list`,
  pageEngineCmdServer: `${apiServer.engine}/engineCmdServer/page`,
  deleteEngineCmdServer: `${apiServer.engine}/engineCmdServer/deleteById`,
  getMqttCommonServer: `${apiServer.engine}/engineCmdServer/getMqttCommonServer`,

  listEngineServerInstance: `${apiServer.engine}/engineServerInstance/list`,
  getEngineServerInstance: `${apiServer.engine}/engineServerInstance/`, // +id
  addEngineServerInstance: `${apiServer.engine}/engineServerInstance/save`,
  updateEngineServerInstance: `${apiServer.engine}/engineServerInstance/update`,
  deleteEngineServerInstance: `${apiServer.engine}/engineServerInstance/deleteById`,
  pageEngineServerInstance: `${apiServer.engine}/engineServerInstance/page`,
  pageEngineServerInstancePageBySpecialPool: `${apiServer.engine}/engineServerInstance/pageBySpecialPool`,
  getValidEngineInstance: `${apiServer.engine}/engineServerInstance/getInstance`,
  occupyInstance: `${apiServer.engine}/engineServerInstance/occupyInstance`,
  releaseInstance: `${apiServer.engine}/engineServerInstance/releaseInstance`,
  forceReleaseInstance: `${apiServer.engine}/engineServerInstance/forceReleaseInstance`,
  startInstanceById: `${apiServer.engine}/engineServerInstance/startInstanceById`,
  stopInstanceById: `${apiServer.engine}/engineServerInstance/stopInstanceById`,
  listByWithoutBind: `${apiServer.engine}/engineServerInstance/listByWithoutBind`,

  saveUserInstance: `${apiServer.engine}/engineUserInstance/save`,
  listUserInstance: `${apiServer.engine}/engineUserInstance/selectUserInstances`,
  updateUserInstance: `${apiServer.engine}/engineUserInstance/update`,
  deleteUserInstanceById: `${apiServer.engine}/engineUserInstance/deleteById`,

  // -----------引擎用户
  engineUserPage: `${apiServer.engine}/engineUser/page`,
  engineUserDeleteById: `${apiServer.engine}/engineUser/deleteById`,
  engineUserBatchAdd: `${apiServer.engine}/engineUser/batchAdd`,
  engineUserUserById: `${apiServer.engine}/engineUser/userById`,

  convertProjectListByPermissions: `${apiServer.engine}/convertProject/listByPermissions`,
  convertProjectTreeByPermissions: `${apiServer.engine}/convertProject/selectTreeByPermissions`,
  convertProjectSavePermissions: `${apiServer.engine}/convertProject/savePermissions`,
  engineGroupSavePermissions: `${apiServer.engine}/engineGroup/savePermissions`,
  engineGroupSaveListByPermissions: `${apiServer.engine}/engineGroup/listByPermissions`,

  getById: `${apiServer.engine}/engineGroup/getById`,
  pageEngineGroup: `${apiServer.engine}/engineGroup/page`,
  listEngineGroup: `${apiServer.engine}/engineGroup/list`,
  addEngineGroup: `${apiServer.engine}/engineGroup/save`,
  updateEngineGroup: `${apiServer.engine}/engineGroup/update`,
  deleteEngineGroup: `${apiServer.engine}/engineGroup/deleteById`,

  listEngineProjectModel: `${apiServer.engine}/engineProjectModel/list`,
  getEngineProjectModel: `${apiServer.engine}/engineProjectModel/`, // +id
  addEngineProjectModel: `${apiServer.engine}/engineProjectModel/save`,
  updateEngineProjectModel: `${apiServer.engine}/engineProjectModel/update`,
  deleteEngineProjectModel: `${apiServer.engine}/engineProjectModel/deleteById`,
  pageEngineProjectModel: `${apiServer.engine}/engineProjectModel/page`,
  selectByProjectId: `${apiServer.engine}/engineProjectModel/selectByProjectId`,

  addEngineTreeGroup: `${apiServer.engine}/engineTreeGroup/save`,
  updateEngineTreeGroup: `${apiServer.engine}/engineTreeGroup/update`,
  listEngineTreeGroup: `${apiServer.engine}/engineTreeGroup/list`,
  deleteEngineTreeGroup: `${apiServer.engine}/engineTreeGroup/deleteById`,

  listEngineTreeNode: `${apiServer.engine}/engineTreeNode/list`,
  saveListEngineTreeNode: `${apiServer.engine}/engineTreeNode/saveList`,
  addEngineTreeNode: `${apiServer.engine}/engineTreeNode/save`,
  updateEngineTreeNode: `${apiServer.engine}/engineTreeNode/update`,
  deleteEngineTreeNode: `${apiServer.engine}/engineTreeNode/deleteById`,

  listModelProperty: `${apiServer.engine}/modelProperty/list`,
  updateModelProperty: `${apiServer.engine}/modelProperty/update`,
  saveModelProperty: `${apiServer.engine}/modelProperty/save`,
  deleteModelProperty: `${apiServer.engine}/modelProperty/deleteById`,
  selectElementInfo: `${apiServer.engine}/modelProperty/selectElementInfo`,
  selectElementIdsByTags: `${apiServer.engine}/modelProperty/selectElementIdsByTags`,

  addEngineProjectView: `${apiServer.engine}/engineProjectView/save`,
  getEngineProjectView: `${apiServer.engine}/engineProjectView/`, // +id
  updateEngineProjectView: `${apiServer.engine}/engineProjectView/update`,
  listEngineProjectView: `${apiServer.engine}/engineProjectView/list`,
  pageEngineProjectView: `${apiServer.engine}/engineProjectView/page`,
  deleteEngineProjectView: `${apiServer.engine}/engineProjectView/deleteById`,

  addEngineProjectRoam: `${apiServer.engine}/engineProjectRoam/save`,
  getEngineProjectRoam: `${apiServer.engine}/engineProjectRoam/`, // +id
  updateEngineProjectRoam: `${apiServer.engine}/engineProjectRoam/update`,
  listEngineProjectRoam: `${apiServer.engine}/engineProjectRoam/list`,
  pageEngineProjectRoam: `${apiServer.engine}/engineProjectRoam/page`,
  deleteEngineProjectRoam: `${apiServer.engine}/engineProjectRoam/deleteById`,

  addEngineProjectAnnotation: `${apiServer.engine}/engineProjectAnnotation/save`,
  getEngineProjectAnnotation: `${apiServer.engine}/engineProjectAnnotation/`, // +id
  updateEngineProjectAnnotation: `${apiServer.engine}/engineProjectAnnotation/update`,
  listEngineProjectAnnotation: `${apiServer.engine}/engineProjectAnnotation/list`,
  pageEngineProjectAnnotation: `${apiServer.engine}/engineProjectAnnotation/page`,
  deleteEngineProjectAnnotation: `${apiServer.engine}/engineProjectAnnotation/deleteById`,

  // 轻量对象

  convertProjectSave: `${apiServer.engine}/convertProject/save`,
  convertProjectUpadte: `${apiServer.engine}/convertProject/update`,
  convertProjectList: `${apiServer.engine}/convertProject/list`,
  convertProjectTree: `${apiServer.engine}/convertProject/tree`,
  convertProjectDeleteById: `${apiServer.engine}/convertProject/deleteById`,
  getConvertProject: `${apiServer.engine}/convertProject/`,
  selectModelTreeByElementId: `${apiServer.engine}/convertModel/selectModelTreeByElementId`,

  // 轻量化转换
  getMachineInfo: `${apiServer.engine}/convertModel/getMachineInfo`,
  getConvertModel: `${apiServer.engine}/convertModel/`,
  listConvertModel: `${apiServer.engine}/convertModel/list`,
  convertModelPage: `${apiServer.engine}/convertModel/page`,
  convertModelMove: `${apiServer.engine}/convertModel/move`,
  convertModelSave: `${apiServer.engine}/convertModel/save`,
  convertModelUpadte: `${apiServer.engine}/convertModel/update`,
  convertModelUploadSlice: `${apiServer.engine}/convertModel/uploadSlice`,
  convertModelMerge: `${apiServer.engine}/convertModel/merge`,
  convertModelConvert: `${apiServer.engine}/convertModel/convert`,
  getConvertingProgress: `${apiServer.engine}/convertModel/getConvertingProgress`,
  getModelByRenderId: `${apiServer.engine}/convertModel/getModelByRenderId`,
  selectModelTree: `${apiServer.engine}/convertModel/selectModelTree`,
  deleteConvertModel: `${apiServer.engine}/convertModel/deleteById`,
  checkModel: `${apiServer.engine}/convertModel/checkModel`,
  produceObj: `${apiServer.engine}/convertModel/produceObj`,
  getObjUrl: `${apiServer.engine}/convertModel/getObjUrl`,
  produceFbx: `${apiServer.engine}/convertModel/produceFbx`,
  getFbxUrl: `${apiServer.engine}/convertModel/getFbxUrl`,
  //objDownloadServer: `${`${location.origin}/dp_engine/${proxy[env].API}`}/${apiServer.engine}/files/`,

  startSyncModel: `${apiServer.engine}/engineServerModel/startSyncModel`,
  selectServerModels: `${apiServer.engine}/engineServerModel/selectServerModels`,
  addServerModels: `${apiServer.engine}/engineServerModel/save`,
  batchAddServerModels: `${apiServer.engine}/engineServerModel/batchSave`,
  deleteSyncModel: `${apiServer.engine}/engineServerModel/deleteById`,

  // 引擎程序管理接口
  addEngineProgram: `${apiServer.engine}/engineProgram/save`,
  updateEngineProgram: `${apiServer.engine}/engineProgram/update`,
  listEngineProgram: `${apiServer.engine}/engineProgram/list`,
  pageEngineProgram: `${apiServer.engine}/engineProgram/page`,
  sliceEngineProgram: `${apiServer.engine}/engineProgram/uploadSlice`,
  mergeEngineProgram: `${apiServer.engine}/engineProgram/merge`,
  deleteEngineProgram: `${apiServer.engine}/engineProgram/deleteById`,
  getEngineProgram: `${apiServer.engine}/engineProgram/`,
  updateNodeEngine: `${apiServer.engine}/engineProgram/updateNodeEngine`
};