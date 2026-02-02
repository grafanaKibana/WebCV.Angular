import { Component } from '@angular/core';
import type { ProjectModel } from '../interfaces/projectModel';

@Component({
  selector: 'app-portfolio-page',
  templateUrl: './portfolio-page.component.html',
  styleUrls: ['./portfolio-page.component.scss']
})
export class PortfolioPageComponent {
  projectsList: Array<ProjectModel> = [
    {
      id: 1,
      name: "AutoHub REST API",
      summary: "Basic CRUD REST API for manage auto auction business.",
      technologies: ["C#", "ASP.NET Web API", "ASP.NET Identity", "EF Core 6", "xUnit", "MS SQL"],
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec congue, tortor nec convallis consequat, mi enim vestibulum purus, non ultricies massa lectus vitae ipsum. Praesent ut diam nec ex elementum tristique. Nulla sodales sit amet nibh a pretium. Vestibulum id lobortis tellus. Aliquam blandit nunc quis egestas dictum. Aliquam vitae eros magna. In iaculis neque quis erat cursus, id convallis elit sollicitudin. Suspendisse potenti. Vivamus scelerisque id tortor at ornare.\n" +
        "\n" +
        "Pellentesque a consequat erat, et tincidunt augue. Quisque imperdiet porta quam molestie imperdiet. Nam vitae vulputate metus. Nulla augue leo, pharetra quis risus nec, feugiat eleifend urna. Phasellus at ultrices nisl, sed rutrum nisi. Ut luctus non urna nec vehicula. Etiam malesuada ligula magna. Donec pulvinar purus id sagittis sollicitudin. Integer fermentum sapien in faucibus cursus. Nullam vitae magna sed urna tempor mattis.\n" +
        "\n" +
        "Nulla quis commodo nunc, in interdum est. Nullam sed bibendum quam, ac maximus dui. Proin eget nunc sit amet nisl accumsan feugiat. In non auctor turpis. Etiam risus mauris, pharetra quis elit vitae, euismod vehicula justo. Sed laoreet lacinia purus a varius. Donec eu purus sapien. Etiam metus elit, tristique ut orci et, euismod placerat risus. Duis tortor ligula, lobortis id fringilla quis, malesuada non ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Phasellus tempor orci eget mauris venenatis, eget ultrices risus tincidunt. Mauris blandit tempus ipsum et sagittis. Sed dignissim massa eros, vel ultricies sem consectetur eu. Donec nec enim dictum, egestas ante faucibus, tempus ante. Donec bibendum ornare justo id molestie. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;\n" +
        "\n" +
        "Sed mauris ante, tristique in velit in, interdum sodales odio. Aliquam vel ipsum ex. Nam in tincidunt dui. Vestibulum volutpat fermentum diam eu posuere. Mauris sit amet aliquet tellus. Nulla tempor nulla consectetur neque efficitur aliquet. Praesent id erat ultricies, pharetra odio id, laoreet nibh. Fusce lacinia felis ut porttitor volutpat. Morbi et purus eleifend est euismod tincidunt. Nullam ultrices vulputate mi, vel fermentum libero tempor eget. Nulla faucibus, nisl vel ullamcorper tristique, elit urna pulvinar augue, a porttitor quam ipsum sed erat. In semper mi et elit tincidunt molestie. Nulla hendrerit egestas malesuada. Sed pretium neque ligula, nec fermentum tellus tempor eget. Suspendisse pretium arcu a lacinia rutrum.",
      imagePath: "assets/images/projectLogos/project-1-logo.png"
    },
    {
      id: 2,
      name: "The Resume",
      summary: "Angular application that represents me and my experience",
      technologies: ["Angular", "TypeScript", "SCSS", "MongoDb", "Node.js"],
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec congue, tortor nec convallis consequat, mi enim vestibulum purus, non ultricies massa lectus vitae ipsum. Praesent ut diam nec ex elementum tristique. Nulla sodales sit amet nibh a pretium. Vestibulum id lobortis tellus. Aliquam blandit nunc quis egestas dictum. Aliquam vitae eros magna. In iaculis neque quis erat cursus, id convallis elit sollicitudin. Suspendisse potenti. Vivamus scelerisque id tortor at ornare.\n" +
        "\n" +
        "Pellentesque a consequat erat, et tincidunt augue. Quisque imperdiet porta quam molestie imperdiet. Nam vitae vulputate metus. Nulla augue leo, pharetra quis risus nec, feugiat eleifend urna. Phasellus at ultrices nisl, sed rutrum nisi. Ut luctus non urna nec vehicula. Etiam malesuada ligula magna. Donec pulvinar purus id sagittis sollicitudin. Integer fermentum sapien in faucibus cursus. Nullam vitae magna sed urna tempor mattis.\n" +
        "\n" +
        "Nulla quis commodo nunc, in interdum est. Nullam sed bibendum quam, ac maximus dui. Proin eget nunc sit amet nisl accumsan feugiat. In non auctor turpis. Etiam risus mauris, pharetra quis elit vitae, euismod vehicula justo. Sed laoreet lacinia purus a varius. Donec eu purus sapien. Etiam metus elit, tristique ut orci et, euismod placerat risus. Duis tortor ligula, lobortis id fringilla quis, malesuada non ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Phasellus tempor orci eget mauris venenatis, eget ultrices risus tincidunt. Mauris blandit tempus ipsum et sagittis. Sed dignissim massa eros, vel ultricies sem consectetur eu. Donec nec enim dictum, egestas ante faucibus, tempus ante. Donec bibendum ornare justo id molestie. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;\n" +
        "\n" +
        "Sed mauris ante, tristique in velit in, interdum sodales odio. Aliquam vel ipsum ex. Nam in tincidunt dui. Vestibulum volutpat fermentum diam eu posuere. Mauris sit amet aliquet tellus. Nulla tempor nulla consectetur neque efficitur aliquet. Praesent id erat ultricies, pharetra odio id, laoreet nibh. Fusce lacinia felis ut porttitor volutpat. Morbi et purus eleifend est euismod tincidunt. Nullam ultrices vulputate mi, vel fermentum libero tempor eget. Nulla faucibus, nisl vel ullamcorper tristique, elit urna pulvinar augue, a porttitor quam ipsum sed erat. In semper mi et elit tincidunt molestie. Nulla hendrerit egestas malesuada. Sed pretium neque ligula, nec fermentum tellus tempor eget. Suspendisse pretium arcu a lacinia rutrum.",
      imagePath: "assets/images/projectLogos/project-2-logo.png"
    }
  ]
}
