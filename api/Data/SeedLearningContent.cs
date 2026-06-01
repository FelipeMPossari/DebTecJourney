using DebTecJourney.Api.Domain;

namespace DebTecJourney.Api.Data;

public static class SeedLearningContent
{
    private static readonly Guid TechnicalDebtCourseId = Guid.Parse("05f52bda-d391-43cf-9b18-45f6bb1e5b8d");
    private static readonly Guid FoundationsModuleId = Guid.Parse("f69785c7-e4ff-4814-99f1-264f400ffcb8");
    private static readonly Guid IdentifyingModuleId = Guid.Parse("f4a0af2a-1d30-41b2-98e4-5c73f9155301");
    private static readonly Guid StrategiesModuleId = Guid.Parse("c8201aa9-84cb-4695-a8a9-e4db1c401a0c");

    private static readonly Guid IntroLessonId = Guid.Parse("b820fdfb-fc97-44ab-945a-8c2ef6874fe5");
    private static readonly Guid SymptomsLessonId = Guid.Parse("a6d753bb-16ea-44e5-b0c6-a63d7c04fd61");
    private static readonly Guid RefactoringLessonId = Guid.Parse("c0336811-7fbc-4bec-96eb-a5280e3c4ae8");

    private static readonly Guid IntroQuestionId = Guid.Parse("5c602b9e-13cf-49f7-9d94-c73bb9583117");
    private static readonly Guid SymptomsQuestionId = Guid.Parse("39637a75-1170-4565-b630-1532e50cd98d");
    private static readonly Guid RefactoringQuestionId = Guid.Parse("c86068f8-c94d-4dc7-8d2b-32afec0ef38b");

    public static IReadOnlyList<Course> Courses { get; } =
    [
        new Course(
            TechnicalDebtCourseId,
            "Dívida Técnica",
            "Aprenda a identificar, medir e tratar decisões técnicas que afetam a evolução de software.",
            1,
            true,
            [
                new LearningModule(
                    FoundationsModuleId,
                    TechnicalDebtCourseId,
                    "Fundamentos",
                    "Conceitos centrais para entender o que é dívida técnica e por que ela aparece.",
                    1,
                    [
                        new Lesson(
                            IntroLessonId,
                            FoundationsModuleId,
                            "O que é dívida técnica?",
                            "Entenda a metáfora da dívida aplicada a decisões de software.",
                            "Dívida técnica surge quando uma decisão acelera a entrega no curto prazo, mas cria custo futuro de manutenção, evolução ou qualidade. Ela pode ser consciente ou acidental, aceitável ou perigosa. O ponto importante é que a equipe precisa enxergar essa dívida, entender seus juros e decidir quando pagar.",
                            1,
                            20,
                            [
                                new Question(
                                    IntroQuestionId,
                                    IntroLessonId,
                                    "Qual alternativa descreve melhor dívida técnica?",
                                    "Dívida técnica não é simplesmente código ruim. Ela representa um custo futuro criado por decisões técnicas que facilitaram ou aceleraram algo no presente.",
                                    1,
                                    [
                                        new AnswerOption(
                                            Guid.Parse("19174fc7-68ed-49b0-9c32-81e3eb1ec69c"),
                                            IntroQuestionId,
                                            "Um custo futuro gerado por decisões técnicas tomadas no presente.",
                                            true,
                                            "Correto. A ideia central é o custo futuro de evolução e manutenção."),
                                        new AnswerOption(
                                            Guid.Parse("2837a949-4abd-424c-927e-825c80ebcb8d"),
                                            IntroQuestionId,
                                            "Qualquer bug encontrado em produção.",
                                            false,
                                            "Bug pode ser consequência de dívida, mas não é sinônimo de dívida técnica."),
                                        new AnswerOption(
                                            Guid.Parse("95609b28-9228-4977-8c6e-34c869a2269a"),
                                            IntroQuestionId,
                                            "Uma regra para impedir entregas rápidas.",
                                            false,
                                            "A metáfora não impede velocidade; ela ajuda a decidir quando velocidade cobra juros.")
                                    ])
                            ])
                    ]),
                new LearningModule(
                    IdentifyingModuleId,
                    TechnicalDebtCourseId,
                    "Identificação",
                    "Sinais, sintomas e métricas que ajudam a encontrar dívida técnica.",
                    2,
                    [
                        new Lesson(
                            SymptomsLessonId,
                            IdentifyingModuleId,
                            "Sinais de alerta",
                            "Reconheça sintomas comuns em sistemas com dívida acumulada.",
                            "Dívida técnica costuma aparecer em mudanças lentas, medo de alterar partes do sistema, testes frágeis, duplicação, acoplamento excessivo e defeitos recorrentes. Esses sinais não provam sozinhos que existe dívida, mas ajudam a equipe a investigar onde o custo futuro está crescendo.",
                            1,
                            25,
                            [
                                new Question(
                                    SymptomsQuestionId,
                                    SymptomsLessonId,
                                    "Qual sinal sugere dívida técnica acumulada?",
                                    "Quando mudanças pequenas exigem muito esforço, o sistema pode estar cobrando juros técnicos por decisões antigas.",
                                    1,
                                    [
                                        new AnswerOption(
                                            Guid.Parse("f1f41ffa-0d5a-493b-a4c2-a439d38abfe0"),
                                            SymptomsQuestionId,
                                            "Mudanças simples exigem alterações em muitos pontos do sistema.",
                                            true,
                                            "Correto. Esse é um sinal comum de acoplamento e baixa modularidade."),
                                        new AnswerOption(
                                            Guid.Parse("95fca399-1726-48e2-91ba-e08ba4e4f71d"),
                                            SymptomsQuestionId,
                                            "O time escreve testes antes de corrigir um bug.",
                                            false,
                                            "Isso geralmente é uma prática de qualidade, não um sintoma de dívida."),
                                        new AnswerOption(
                                            Guid.Parse("ee72058a-a2d9-4e77-9e1a-03d9a1d483fb"),
                                            SymptomsQuestionId,
                                            "A equipe documenta uma decisão arquitetural.",
                                            false,
                                            "Documentar decisões ajuda a controlar e comunicar dívida técnica.")
                                    ])
                            ])
                    ]),
                new LearningModule(
                    StrategiesModuleId,
                    TechnicalDebtCourseId,
                    "Estratégias",
                    "Formas práticas de priorizar, reduzir e monitorar dívida técnica.",
                    3,
                    [
                        new Lesson(
                            RefactoringLessonId,
                            StrategiesModuleId,
                            "Pagando a dívida",
                            "Veja quando refatorar e como reduzir risco durante melhorias.",
                            "Pagar dívida técnica não significa parar o produto para reescrever tudo. Uma estratégia saudável combina pequenas refatorações, testes de proteção, priorização por impacto e monitoramento contínuo. O melhor pagamento é aquele que reduz risco e aumenta capacidade de entrega.",
                            1,
                            30,
                            [
                                new Question(
                                    RefactoringQuestionId,
                                    RefactoringLessonId,
                                    "Qual abordagem tende a ser mais saudável para pagar dívida técnica?",
                                    "Refatorações menores, guiadas por risco e protegidas por testes, reduzem o perigo de trocar uma dívida conhecida por outra maior.",
                                    1,
                                    [
                                        new AnswerOption(
                                            Guid.Parse("627f87df-2979-4847-9058-9a663cb3bb4a"),
                                            RefactoringQuestionId,
                                            "Refatorar incrementalmente áreas críticas com apoio de testes.",
                                            true,
                                            "Correto. Essa abordagem reduz risco e mantém entrega contínua."),
                                        new AnswerOption(
                                            Guid.Parse("bedfc2fd-4ced-4034-8adc-d7236f6eefae"),
                                            RefactoringQuestionId,
                                            "Reescrever todo o sistema sempre que houver dívida.",
                                            false,
                                            "Reescritas completas são caras, arriscadas e raramente são a primeira opção."),
                                        new AnswerOption(
                                            Guid.Parse("d19aa20e-d318-46c7-8800-10bddaf5e94e"),
                                            RefactoringQuestionId,
                                            "Ignorar a dívida enquanto novas funcionalidades forem entregues.",
                                            false,
                                            "Ignorar indefinidamente aumenta juros técnicos e reduz capacidade de evolução.")
                                    ])
                            ])
                    ])
            ])
    ];

    public static Course? FindCourse(Guid courseId) =>
        Courses.FirstOrDefault(course => course.Id == courseId);

    public static LearningModule? FindModule(Guid moduleId) =>
        Courses.SelectMany(course => course.Modules).FirstOrDefault(module => module.Id == moduleId);

    public static Lesson? FindLesson(Guid lessonId) =>
        Courses.SelectMany(course => course.Modules)
            .SelectMany(module => module.Lessons)
            .FirstOrDefault(lesson => lesson.Id == lessonId);

    public static Question? FindQuestion(Guid questionId) =>
        Courses.SelectMany(course => course.Modules)
            .SelectMany(module => module.Lessons)
            .SelectMany(lesson => lesson.Questions)
            .FirstOrDefault(question => question.Id == questionId);
}
