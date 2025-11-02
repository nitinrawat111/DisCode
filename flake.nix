{
  description = "Discode Nix Shell";
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
      ];

      shellHook = ''
        echo "Shell Ready"
        echo "Node Version" && node -v
      '';
    };
  };
}
