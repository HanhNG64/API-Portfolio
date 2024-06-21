class MainError extends Error {
  constructor(errorMessage) {
    super();
    this.name = this.constructor.name;
    this.message = errorMessage;

    if (this instanceof RequestError) {
      this.statusCode = 400;
      this.type = "request";
    }
    if (this instanceof Project) {
      this.statusCode = 404;
      this.type = "project";
    }
  }
}

class RequestError extends MainError {}
class ProjectError extends MainError {}

module.exports = { MainError, RequestError, ProjectError };
