{
  description = "Dev shell with Node.js and PostgreSQL";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
  outputs = { self, nixpkgs }: {
    devShells.x86_64-linux.default = let
      pkgs = import nixpkgs {
        system = "x86_64-linux";
        config.allowUnfree = true;
      };
    in pkgs.mkShell {
      buildInputs = [
        pkgs.nodejs_22
        pkgs.postgresql_17_jit
        pkgs.mongodb
        pkgs.git
      ];

      shellHook = ''
        echo "🔧 Dev shell ready"
        echo "Node Version" && node -v
        echo "Postgres version" && psql --version
        echo "MongoDB version" && mongod --version
      '';
    };
  };
}
