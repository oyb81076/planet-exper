package com.example.thymeleaf

import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping

@Controller
class HomeController {
  @GetMapping
  fun home(model: Model):String {
    model.addAttribute("title", "Model.title")
    model.addAttribute("users", listOf(User(1, "欧阳斌"), User(2, "玉米")))
    model.addAttribute("price", 0)
    return "index"
  }
}

data class User(
  val id: Long,
  val name: String
)
